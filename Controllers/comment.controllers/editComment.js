import Comment from "../../models/comment.js";
import User from "../../models/User.js";

const editComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { user } = req;
    const { content } = req.body;

    const trimmedContent = content?.trim();

    if (!trimmedContent || trimmedContent.length === 0) {
      return res.status(400).json({ message: "A comment must have content" });
    }

    if (trimmedContent.length > 1000) {
      return res.status(400).json({ message: "Only 1000 characters are allowed" });
    }

    const comment = await Comment.findById(commentId);
    if (!comment || !comment.author.equals(user._id)) {
      return res.status(400).json({ message: "Cannot edit this comment" });
    }

    const words = trimmedContent.split(" ");
    const potentialMentions = words
      .filter((word) => word.startsWith("@"))
      .map((word) => word.slice(1).trim());

    let mentions = [];
    if (potentialMentions.length > 0) {
      const mentionedUsers = await User.find({
        username: { $in: potentialMentions },
      }).select("_id");

      mentions = mentionedUsers.map((u) => u._id);
    }

    comment.content = trimmedContent;
    comment.mentions = mentions;
    await comment.save();

    const populatedComment = await comment.populate([
      { path: "author", select: "name username avatar" },
      { path: "mentions", select: "name username avatar" },
      { path: "likes", select: "_id" },
    ]);

    return res.status(200).json({
      message: "Comment updated successfully",
      comment: populatedComment,
    });

  } catch (error) {
    
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export default editComment;
