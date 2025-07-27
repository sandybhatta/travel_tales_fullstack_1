import Comment from "../../models/comment.js";

const likeUnlikeComment = async (req, res) => {
  try {
    const { user } = req;
    const { commentId } = req.params;

    const comment = await Comment.findById(commentId).select("likes");
    if (!comment) {
      return res.status(404).json({ message: "No comment found" });
    }

    const alreadyLiked = comment.likes.some(
      (likeId) => likeId.toString() === user._id.toString()
    );

    if (alreadyLiked) {
      comment.likes = comment.likes.filter(
        (likeId) => likeId.toString() !== user._id.toString()
      );
    } else {
      comment.likes.push(user._id);
    }

    await comment.save();

    return res.status(200).json({
      message: alreadyLiked ? "Comment unliked" : "Comment liked",
      likeCount: comment.likes.length,
    });

  } catch (error) {
    console.error("Error in likeUnlikeComment:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export default likeUnlikeComment;
