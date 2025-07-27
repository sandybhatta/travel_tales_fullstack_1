import Comment from "../../models/comment.js";
import Post from "../../models/post.js";

const getRootComment = async (req, res) => {
  try {
    const{user} = req;
    const { postId } = req.params;

    const post = await Post.findById(postId).select("_id");
    if (!post) {
      return res.status(404).json({ message: "No post found" });
    }

    //  root-level comments
    const rootComments = await Comment.find({
      post: post._id,
      parentComment: null,
      rootComment: null,
      isDeleted:false,
    })
      .sort({ createdAt: -1 }) 
      .populate([
        {
          path:"author",
          select:"name username avatar"
        },
        {
          path:"mentions",
          select:"name username avatar"
        },
        {
          path:"likes",
          select:"_id"
        }
      ]) 
      .lean(); 

    if (rootComments.length === 0) {
      return res.status(200).json({ message: "No comments yet", comments: [] });
    }

    
    const commentsWithReplyCount = await Promise.all(
      rootComments.map(async (comment) => {
        const replyCount = await Comment.countDocuments({
          parentComment: comment._id,
        });
        return {
          ...comment,
          replyCount,
          isOwner:comment.author._id.equals(user._id)
        };
      })
    );

    return res.status(200).json({ comments: commentsWithReplyCount });
  } catch (error) {
    console.error("Error in getRootComment:", error.message);
    return res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};

export default getRootComment;
