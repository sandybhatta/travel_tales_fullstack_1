import mongoose from "mongoose";
import { buildCommentTree } from "../utils/buildCommentTree.js";
const commentSchema = new mongoose.Schema(
  {
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      required: true,
      
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
      trim: true,
    },
    parentComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
    rootComment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
      default: null,
    },
    mentions: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);




// is the comment liked by the user
commentSchema.methods.isLikedBy = function (userId) {
    if (!userId) return false;
    return this.likes.some(
      (id) => id.toString() === userId.toString()
    );
  };

//for toggling comment likes
commentSchema.methods.toggleLike = async function (userId) {
    if (!userId) throw new Error("User ID is required");
  
    const hasLiked = this.isLikedBy(userId); // 👈 using helper
  
    if (hasLiked) {
      this.likes.pull(userId); // Unlike
    } else {
      this.likes.push(userId); // Like
    }
  
    await this.save();
  
    return {
      updatedComment: this,
      liked: !hasLiked
    };
  };
  
  //is reply virtual method to send in response

  commentSchema.virtual("isReply").get(function () {
    return !!this.parentComment;
  });

//   Instance Method: For internal logic



// comment soft delete , marking the isdelete true and content to [deleted]

commentSchema.methods.softDelete = async function () {
    // Mark the comment as deleted
    this.isDeleted = true;
  
    // Optionally, also remove sensitive data like content
    this.content = "[deleted]";
  
    await this.save();
  
    return this; // return the updated comment if needed
  };

 
 
  
  commentSchema.statics.getThread = async function (postId) {
    const comments = await this.find({ post: postId })
      .sort({ createdAt: 1 })
      .lean(); // faster for tree building
    return buildCommentTree(comments);
  };

// Add index for performance
commentSchema.index({ post: 1 });
commentSchema.index({ parentComment: 1 });

export default mongoose.model("Comment", commentSchema);
