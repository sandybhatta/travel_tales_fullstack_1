import Post from "../../models/post.js";
import Comment from "../../models/comment.js";
import User from "../../models/User.js";

const getPostDetails = async (req, res) => {
  try {
    const { postId } = req.params;
    const { user } = req

    const post = await Post.findById(postId)
      .populate([
        {
          path: "author",
          select: "name username avatar",
        },
        {
          path: "taggedUsers",
          select: "name username avatar",
        },
        {
          path: "likes",
          select: "name username avatar",
        },
        {
          path: "trip",
          select: "title visibility startDate endDate",
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
              path: "likes",
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
    
    
    // Count total comments for this post
    const commentsCount = await Comment.countDocuments({ post: post._id });

    res.status(200).json({
      message: "Post details fetched successfully",
      post,
      isOwner:post.author._id.toString()===user._id.toString(),
      likesCount:post.likes?.length||0,
      commentsCount,
    });
  } catch (error) {
    console.error("Error fetching post details:", error);
    res.status(500).json({ message: "Server error while fetching post" });
  }
};

export default getPostDetails;
