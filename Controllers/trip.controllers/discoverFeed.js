import Post from "../models/post.js";
import Trip from "../models/trip.js";
import User from "../models/User.js";

const discoverFeed = async (req, res) => {
  try {
    const user = req.user;
    const limit = parseInt(req.query.limit) || 20;
    const cursor = req.query.cursor || null;
    const cursorFilter = cursor ? { createdAt: { $lt: new Date(cursor) } } : {};

    // Fetch user context
    const currentUser = await User.findById(user._id)
      .select("following closeFriends interests bookmarks blockedUsers")
      .lean();

    const followingIds = currentUser.following.map(id => id.toString());
    const closeFriendIds = currentUser.closeFriends.map(id => id.toString());
    const interestTags = currentUser.interests || [];
    const blockedUserIds = currentUser.blockedUsers.map(id => id.toString());
    const bookmarks = currentUser.bookmarks.map(id => id.toString());

    // Define postQuery
    const postQuery = {
      $and: [
        {
          $or: [
            { visibility: "public" },
            { visibility: "followers", author: { $in: followingIds } },
            { visibility: "close_friends", author: { $in: closeFriendIds } },
            { author: user._id },
          ]
        },
        {
          $or: [
            { hashtags: { $in: interestTags } },
            { taggedUsers: user._id },
            { taggedUsers: { $in: followingIds } },
            { taggedUsers: { $in: closeFriendIds } },
          ]
        },
        {
          author: { $nin: blockedUserIds }
        },
        cursorFilter
      ]
    };

    // Trip visibility filter
    const visibilityFilter = {
      $or: [
        { visibility: "public" },
        { visibility: "followers", user: { $in: followingIds } },
        { visibility: "close_friends", user: { $in: closeFriendIds } },
        { user: user._id }
      ]
    };

    // Fetch posts
    let posts = await Post.find(postQuery)
      .populate([
        { path: "author", select: "name username avatar" },
        { path: "taggedUsers", select: "name username avatar" },
        { path: "tripId", select: "title" },
        { path: "sharedFrom", populate: { path: "author", select: "username avatar" } }
      ])
      .sort({ createdAt: -1 })
      .limit(limit * 3)
      .lean();

    // Fetch trips
    let trips = await Trip.find({
      ...visibilityFilter,
      user: { $nin: blockedUserIds },
      isArchived: false,
      $or: [
        { tags: { $in: interestTags } },
        { isCompleted: true },
        { user: user._id },
        { user: { $in: followingIds } },
        { user: { $in: closeFriendIds } },
      ],
      ...cursorFilter
    })
      .populate("user", "username avatar name")
      .sort({ createdAt: -1 })
      .limit(limit * 3)
      .lean();

    // Score helper
    const scoreContent = (item, type = "post") => {
      let score = 0;
      const likes = item.likes?.length || 0;
      const comments = item.comments?.length || 0;

      const authorId = type === "post" ? item.author?._id?.toString() : item.user?._id?.toString();
      if (closeFriendIds.includes(authorId)) score += 30;
      if (followingIds.includes(authorId)) score += 20;
      if (type === "post" && item.tripId) score += 15;
      if (item.hashtags?.some(tag => interestTags.includes(tag))) score += 10;
      if (item.tags?.some(tag => interestTags.includes(tag))) score += 15;
      if (item.isFeatured || item.boosted) score += 25;

      const engagement = likes + comments;
      score += Math.min(engagement, 50);
      if (engagement === 0) score -= 10;

      return score;
    };

    // Wrap content with score
    const wrappedPosts = posts.map(post => ({
      type: "post",
      data: { ...post, _score: scoreContent(post, "post") }
    }));

    const wrappedTrips = trips.map(trip => ({
      type: "trip",
      data: { ...trip, _score: scoreContent(trip, "trip") }
    }));

    // Merge, sort, deduplicate
    const fullFeed = [...wrappedPosts, ...wrappedTrips];
    fullFeed.sort((a, b) => b.data._score - a.data._score || new Date(b.data.createdAt) - new Date(a.data.createdAt));

    const seenAuthors = new Set();
    const filteredFeed = [];
    for (const item of fullFeed) {
      const authorId = (item.type === "post" ? item.data.author._id : item.data.user._id).toString();
      if (seenAuthors.has(authorId)) continue;
      seenAuthors.add(authorId);
      filteredFeed.push(item);
      if (filteredFeed.length >= limit) break;
    }

    // Pre-fetch like-users for UX enrichment
    const allLikedIds = new Set();
    filteredFeed.forEach(item => {
      item.data.likes?.forEach(id => allLikedIds.add(id.toString()));
    });
    const likedUsers = await User.find({ _id: { $in: [...allLikedIds] } }).select("username").lean();
    const likedUserMap = Object.fromEntries(likedUsers.map(u => [u._id.toString(), u.username]));

    // Enrichment
    for (let item of filteredFeed) {
      const d = item.data;

      if (item.type === "post") {
        d.isLikedByViewer = d.likes?.some(id => id.toString() === user._id.toString());
        d.isBookmarkedByViewer = bookmarks.includes(d._id.toString());
        d.likeCount = d.likes?.length || 0;
        d.commentCount = d.comments?.length || 0;
        d.fromTrip = d.tripId?.title || null;

        const intersect = followingIds.filter(f => d.likes?.map(id => id.toString()).includes(f));
        if (intersect.length && likedUserMap[intersect[0]]) {
          d.likedByFriend = `${likedUserMap[intersect[0]]} liked this`;
        }
      } else {
        d.isLikedByViewer = d.likes?.some(id => id.toString() === user._id.toString());
        d.likeCount = d.likes?.length || 0;

        const intersect = followingIds.filter(f => d.likes?.map(id => id.toString()).includes(f));
        if (intersect.length && likedUserMap[intersect[0]]) {
          d.likedByFriend = `${likedUserMap[intersect[0]]} liked this trip`;
        }
      }
    }

    const nextCursor = filteredFeed.length ? filteredFeed[filteredFeed.length - 1].data.createdAt : null;

    res.status(200).json({
      feed: filteredFeed,
      nextCursor,
      hasMore: fullFeed.length > filteredFeed.length
    });
  } catch (err) {
    console.error("Discover Feed Error:", err);
    res.status(500).json({ message: "Server error while generating feed" });
  }
};

export default discoverFeed;
