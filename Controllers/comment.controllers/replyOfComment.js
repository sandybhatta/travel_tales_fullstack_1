import Post from "../../models/post.js";
import Comment from "../../models/comment.js";
import User from "../../models/User.js";

const replyOfComment = async (req, res) => {
  try {
    const { user } = req;
    const { content } = req.body;
    const { postId, parentCommentId } = req.params;

    // 1. Basic validation
    const trimmedContent = content?.trim();
    if (!trimmedContent || trimmedContent.length === 0) {
      return res.status(400).json({ message: "Comment must contain some content" });
    }
    if (trimmedContent.length > 1000) {
      return res.status(400).json({ message: "Comment must be within 1000 characters" });
    }

    // 2. Validate post
    const post = await Post.findById(postId).select("_id");
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // 3. Validate parent comment
    const parentComment = await Comment.findById(parentCommentId);
    if (!parentComment || parentComment.isDeleted) {
      return res.status(400).json({ message: "Cannot reply to this comment" });
    }

    // 4. Ensure parent comment belongs to the post
    if (parentComment.post.toString() !== post._id.toString()) {
      return res.status(400).json({ message: "Parent comment does not belong to the specified post" });
    }

    // 5. Handle mentions (e.g., @username)
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

    // 6. Create the reply
    const newReply = await Comment.create({
      post: post._id,
      author: user._id,
      content: trimmedContent,
      parentComment: parentComment._id,
      mentions,
    });

    // 7. Return success response (optional: return newReply)
    return res.status(201).json({
      message: "Reply created successfully",
      reply: newReply,
    });

  } catch (error) {
    console.error("Error in replyOfComment:", error);
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export default replyOfComment;
