// utils/deleteCommentThread.js
import Comment from "../models/comment.js";

export const deleteCommentThread = async (commentId) => {
  // Step 1: Find and delete the comment
  const comment = await Comment.findById(commentId);
  if (!comment) return;

  

  // Step 2: Find all replies (children) of this comment
  const childComments = await Comment.find({ parentComment: commentId });

  // Step 3: Recursively delete each child
  for (let child of childComments) {
    await deleteCommentThread(child._id);
  }
  await comment.deleteOne();
};
