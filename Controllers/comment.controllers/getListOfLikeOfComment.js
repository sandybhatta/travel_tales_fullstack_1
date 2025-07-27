import Comment from "../../models/comment.js";

const getListOfLikeOfComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { user } = req;

    const comment = await Comment.findById(commentId)
      .select("likes")
      .populate("likes", "name username avatar");

    if (!comment) {
      return res.status(404).json({ message: "No comment found" });
    }

    const followingIds = user.following.map((fid) => fid.toString());

    const likesWithFollowFlag = comment.likes.map((like) => ({
      ...like.toObject(),
      isFollowing: followingIds.includes(like._id.toString()),
    }));

    return res.status(200).json({
      likes: likesWithFollowFlag,
    });
  } catch (error) {
    
    return res.status(500).json({
      message: "Internal server error",
      error: error.message,
    });
  }
};

export default getListOfLikeOfComment;
