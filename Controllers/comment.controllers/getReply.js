import Comment from "../../models/comment.js";

const getReply = async (req, res) => {
  try {
    const { user } = req;
    const { parentCommentId } = req.params;

    const parentComment = await Comment.findById(parentCommentId);
    if (!parentComment || parentComment.isDeleted) {
      return res.status(404).json({ message: "Parent comment not found or deleted" });
    }

    const replies = await Comment.find({ parentComment: parentCommentId })
      .sort({ createdAt: -1 }) 
      .populate("author", "name username avatar")
      .lean();

    
    const repliesWithCounts = await Promise.all(
      replies.map(async (reply) => {
        const replyCount = await Comment.countDocuments({ parentComment: reply._id });
        return {
          ...reply,
          replyCount,
          isOwner:reply.author._id.equals(user._id)
        };
      })
    );

    return res.status(200).json({
      replies: repliesWithCounts,
    });
  } catch (error) {
    console.error("Error fetching replies:", error.message);
    return res.status(500).json({ message: "Internal server error", error: error.message });
  }
};

export default getReply;
