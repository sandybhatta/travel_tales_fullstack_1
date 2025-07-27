import Post from "../../models/post.js";
import Comment from "../../models/comment.js";
import User from "../../models/User.js";

const replyOfComment = async (req, res) => {
  try {
    const { user } = req;
    const { content } = req.body;
    const { postId, rootCommentId, parentCommentId } = req.params;

    
    const trimmedContent = content?.trim();
    if (!trimmedContent || trimmedContent.length === 0) {
      return res.status(400).json({ message: "Reply must contain content." });
    }
    if (trimmedContent.length > 1000) {
      return res.status(400).json({ message: "Maximum 1000 characters allowed." });
    }

    
    const post = await Post.findById(postId).select("_id");
    if (!post) {
      return res.status(404).json({ message: "Post not found." });
    }

    
    const parentComment = await Comment.findById(parentCommentId);
    if (!parentComment || parentComment.isDeleted) {
      return res.status(400).json({ message: "Cannot reply to this comment." });
    }

    // Ensure parent comment belongs to the post
    if (parentComment.post.toString() !== post._id.toString()) {
      return res.status(400).json({ message: "Parent comment doesn't belong to this post." });
    }

    // Validate root comment
    const rootComment = await Comment.findById(rootCommentId).select("_id");
    if (!rootComment || rootComment.post.toString() !== post._id.toString()) {
      return res.status(400).json({ message: "Invalid root comment for this post." });
    }

    // Extract @mentions
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

    // Create reply
    const newReply = await Comment.create({
      post: post._id,
      author: user._id,
      content: trimmedContent,
      parentComment: parentComment._id,
      rootComment: rootComment._id,
      mentions,
    });

    return res.status(201).json({
      message: "Reply created successfully.",
      reply: newReply,
    });

  } catch (error) {
    console.error("Reply creation error:", error);
    return res.status(500).json({
      message: "Internal server error.",
      error: error.message,
    });
  }
};

export default replyOfComment;
