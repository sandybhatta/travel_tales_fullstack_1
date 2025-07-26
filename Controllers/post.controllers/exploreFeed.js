import Post from "../../models/post.js";
import Trip from "../../models/trip.js";
import User from "../../models/User.js";

const exploreFeed = async (req, res) => {
  try {
    const { user } = req;
    const page = parseInt(req.query.page) || 0;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page-1)*limit;

    const interests = user.interests || [];
    const followingIds = user.following.map(id => id.toString());
    const closeFriendIds = user.closeFriends.map(id => id.toString());

    //  interest-based users
    const interestBasedUsers = await User.find({
      interests: { $in: interests },
      _id: { $ne: user._id },
    }).select("_id");

    const interestUserIds = interestBasedUsers.map(u => u._id.toString());

    //  Post Criteria
    const postFilter = {
      author: { $ne: user._id },
       visibility: "public" ,
      $or: [
        
        { author: { $in: interestUserIds } },
        { hashtags: { $in: interests } },
        { mentions: { $in: followingIds } },
        { mentions: { $in: closeFriendIds } },
        { likes: { $in: followingIds } },
        { likes: { $in: closeFriendIds } },
        
      ],
    };

    const posts = await Post.find(postFilter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Math.floor(limit/2))
      .populate([
        { path: "author", select: "name username avatar" },
        { path: "taggedUsers", select: "name username avatar" },
        { path: "likes", select: "_id" },
        { path: "comments", select: "_id" },
        {
          path: "tripId",
          match: { visibility: "public" }, 
          populate: [
            { path: "user", select: "name username avatar" },
            { path: "acceptedFriends.user", select: "name username avatar" }
          ]
        },
        {
          path: "sharedFrom",
          populate: [
            { path: "author", select: "name username avatar" },
            { path: "tripId", match: { visibility: "public" } },
            { path: "taggedUsers", select: "name username avatar" },
          ]
        },
      ]);

    // Trip Criteria
    const tripFilter = {
      visibility: "public",
      isArchived: false,
      user: { $ne: user._id },
      $or: [
        { tags: { $in: interests } },
        { user: { $in: interestUserIds } },
        { acceptedFriends: { $elemMatch: { user: { $in: followingIds } } } },
        { acceptedFriends: { $elemMatch: { user: { $in: closeFriendIds } } } },
      ],
    };

    const trips = await Trip.find(tripFilter)
      .sort({ createdAt: -1 }) // or sort by trending/popular
      .skip(skip)
      .limit(Math.floor(limit/2))
      .populate([
        { path: "user", select: "name username avatar" },
        { path: "acceptedFriends.user", select: "name username avatar" },
        
      ]);

    //  Mix posts and trips together for final feed
    const feedItems = [...posts, ...trips];

    // Optional: shuffle/mix/diversify
    feedItems.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

   
    

    return res.status(200).json({
      feed: limitedFeed,
      hasMore: feedItems.length > (skip + limit)
    });

  } catch (error) {
    console.error(" Error in exploreFeed:", error);
    return res.status(500).json({ message: "Explore feed failed", error });
  }
};

export default exploreFeed;
