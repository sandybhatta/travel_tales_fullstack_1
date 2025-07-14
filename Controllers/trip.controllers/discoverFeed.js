import Post from "../models/post.js";
import Trip from "../models/trip.js";
import User from "../models/User.js";


const discoverFeed = async (req, res) => {
  try {
    const user = req.user;
    const limit = parseInt(req.query.limit) || 20;
    const cursor = req.query.cursor || null;

    //  User Context
    const currentUser = await User.findById(user._id)
      .select("following closeFriends interests bookmarks blockedUsers")
      .lean();

    const followingIds = currentUser.following.map(id => id.toString());
    const closeFriendIds = currentUser.closeFriends.map(id => id.toString());
    const interestTags = currentUser.interests;
    const blockedUserIds = currentUser.blockedUsers.map(id => id.toString());

    // Common filter for both posts and trips
    const visibilityFilter = {
      $or: [
        { visibility: "public" },
        { visibility: "followers", author: { $in: followingIds } },
        { visibility: "close_friends", author: { $in: closeFriendIds } },
      ],
    };

    // Cursor filtering
    const cursorFilter = cursor ? { createdAt: { $lt: new Date(cursor) } } : {};

    // Fetch Posts
    let posts = await Post.find({
      ...visibilityFilter,
      author: { $nin: blockedUserIds },
      $or: [
        { author: user._id },
        { author: { $in: followingIds } },
        { author: { $in: closeFriendIds } },
        { hashtags: { $in: interestTags } },
        { tripId: { $ne: null } },
        { isFeatured: true },
      ],
      ...cursorFilter,
    })
      .populate("author", "username avatar name")
      .populate("tripId", "title")
      .sort({ createdAt: -1 })
      .limit(limit * 2)
      .lean();

    //  Fetch Trips
    let trips = await Trip.find({
      ...visibilityFilter,
      user: { $nin: blockedUserIds },
      isArchived: false,
      $or: [
        { user: user._id },
        { user: { $in: followingIds } },
        { user: { $in: closeFriendIds } },
        { tags: { $in: interestTags } },
        { isCompleted: true },
      ],
      ...cursorFilter,
    })
      .populate("user", "username avatar name")
      .sort({ createdAt: -1 })
      .limit(limit)
      .lean();

    //  Compute Score + Wrap with Type
    const wrappedPosts = posts.map(post => {
      let score = 0;
      const engagement = (post.likes?.length || 0) + (post.comments?.length || 0);
      if (closeFriendIds.includes(post.author._id.toString())) score += 30;
      if (followingIds.includes(post.author._id.toString())) score += 20;
      if (post.tripId) score += 15;
      if (post.hashtags?.some(tag => interestTags.includes(tag))) score += 10;
      if (post.isFeatured) score += 25;
      score += Math.min(engagement, 50);
      if (engagement === 0) score -= 10;

      return { type: "post", data: { ...post, _score: score } };
    });

    const wrappedTrips = trips.map(trip => {
      let score = 0;
      if (closeFriendIds.includes(trip.user._id.toString())) score += 30;
      if (followingIds.includes(trip.user._id.toString())) score += 20;
      if (trip.tags?.some(tag => interestTags.includes(tag))) score += 15;
      if (trip.isCompleted) score += 15;
      score += Math.min(trip.totalLikes || 0, 50);
      if ((trip.totalLikes || 0) === 0) score -= 10;

      return { type: "trip", data: { ...trip, _score: score } };
    });

    //  Combine and Sort Feed
    const fullFeed = [...wrappedPosts, ...wrappedTrips];
    fullFeed.sort((a, b) => b.data._score - a.data._score || new Date(b.data.createdAt) - new Date(a.data.createdAt));

    //  Deduplication & Diversity
    const seenAuthors = new Set();
    const filteredFeed = [];
    for (const item of fullFeed) {
      const authorId = (item.type === "post" ? item.data.author._id : item.data.user._id).toString();
      if (seenAuthors.has(authorId)) continue;
      seenAuthors.add(authorId);
      filteredFeed.push(item);
      if (filteredFeed.length >= limit) break;
    }

    //  Enrichment
    for (let item of filteredFeed) {
      const postOrTrip = item.data;

      if (item.type === "post") {
        postOrTrip.isLikedByViewer = postOrTrip.likes?.some(id => id.toString() === user._id.toString());
        postOrTrip.isBookmarkedByViewer = currentUser.bookmarks?.some(id => id.toString() === postOrTrip._id.toString());
        postOrTrip.likeCount = postOrTrip.likes?.length || 0;
        postOrTrip.commentCount = postOrTrip.comments?.length || 0;
        postOrTrip.fromTrip = postOrTrip.tripId ? postOrTrip.tripId.title : null;

        // Show UX boost: X liked this post
        const usersWhoLiked = postOrTrip.likes?.map(id => id.toString()) || [];
        const intersect = followingIds.filter(f => usersWhoLiked.includes(f));
        if (intersect.length) {
          const userObj = await User.findById(intersect[0]).select("username").lean();
          if (userObj) postOrTrip.likedByFriend = `${userObj.username} liked this`;
        }
      }

      if (item.type === "trip") {
        postOrTrip.isLikedByViewer = false; // Optional: implement trip likes array
        postOrTrip.likeCount = postOrTrip.totalLikes || 0;

        const usersWhoLikedTrip = postOrTrip.likes?.map(id => id.toString()) || [];
        const intersect = followingIds.filter(f => usersWhoLikedTrip.includes(f));
        if (intersect.length) {
          const userObj = await User.findById(intersect[0]).select("username").lean();
          if (userObj) postOrTrip.likedByFriend = `${userObj.username} liked this trip`;
        }
      }
    }

    // Pagination
    const nextCursor = filteredFeed.length ? filteredFeed[filteredFeed.length - 1].data.createdAt : null;

    res.status(200).json({
      feed: filteredFeed,
      nextCursor,
      hasMore: fullFeed.length > filteredFeed.length,
    });
  } catch (err) {
    console.error("Discover Feed Error:", err);
    res.status(500).json({ message: "Server error while generating feed" });
  }
};

export default discoverFeed;
