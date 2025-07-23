import Post from "../../models/post.js";
import Comment from "../../models/comment.js";
import Trip from "../../models/trip.js";

const getPostDetails = async (req, res) => {
  try {
    const { postId } = req.params;
    const { user } = req;

    const post = await Post.findById(postId)
      .populate([
        {
          path: "author",
          select: "name username avatar followers closeFriends",
        },
        {
          path: "taggedUsers",
          select: "name username avatar",
        },
        {
          path: "trip",
          select: "title visibility startDate endDate collaborators user",
        },
        {
          path: "sharedFrom",
          populate: [
            {
              path: "author",
              select: "name username avatar",
            },
            {
              path: "taggedUsers",
              select: "name username avatar",
            },
            {
              path: "trip",
              select: "title visibility startDate endDate",
            },
          ],
        },
      ]);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    const isOwner = post.author._id.toString() === user._id.toString();

    // Step 1: Trip-based visibility
    if (post.trip) {
      const canView = await post.trip.canView(user);
      if (!canView) {
        return res.status(403).json({ message: "You are not allowed to view this post." });
      }
    } else {
      // Step 2: Post-level visibility
      const visibility = post.visibility || "public";

      if (!isOwner) {
        if (visibility === "followers") {
          const followerIds = post.author.followers.map((f) => f._id.toString());
          if (!followerIds.includes(user._id.toString())) {
            return res.status(403).json({
              message: "Only followers and the post owner can see the post",
            });
          }
        } else if (visibility === "close_friends") {
          const closeFriendIds = post.author.closeFriends.map((f) => f._id.toString());
          if (!closeFriendIds.includes(user._id.toString())) {
            return res.status(403).json({
              message: "Only close friends and the post owner can see the post",
            });
          }
        } else if (visibility === "private") {
          return res.status(403).json({
            message: "Only the post owner can see this post",
          });
        }
      }
    }

    // Step 2.5: If this post is a shared post, ensure the original post is still viewable
if (post.sharedFrom && !isOwner) {
  const original = post.sharedFrom;
  
  const isTripShared = !original.trip || original.trip.visibility === "public";
  const isPostShared = (original.visibility || "public") === "public";

  if (!isTripShared || !isPostShared) {
    return res.status(403).json({
      message: "The original post has been restricted by the author.",
    });
  }
}

    // Step 3: Engagement info
    const [commentsCount, hasLiked] = await Promise.all([
      Comment.countDocuments({ post: post._id }),
      Post.exists({ _id: post._id, likes: user._id })
    ]);
    const likesCount = post.likes?.length || 0;

    // Step 4: Shareability
    const sharedFrom = post.sharedFrom;
    const canShare = (post.visibility || "public") === "public" &&
      (!post.trip || post.trip.visibility === "public") &&
      (!sharedFrom || (
        (sharedFrom.visibility || "public") === "public" &&
        (!sharedFrom.trip || sharedFrom.trip.visibility === "public")
      ));

    res.status(200).json({
      message: "Post details fetched successfully",
      post,
      isOwner,
      likesCount,
      commentsCount,
      hasLiked: !!hasLiked,
      canShare,
    });
  } catch (error) {
    console.error("Error fetching post details:", error);
    res.status(500).json({ message: "Server error while fetching post" });
  }
};

export default getPostDetails;

