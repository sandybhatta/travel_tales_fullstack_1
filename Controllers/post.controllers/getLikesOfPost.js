
import Post from "../../models/post.js";

const getLikesOfPost = async (req, res) => {
  try {
    const { user } = req;
    const { postId } = req.params;

   

    const post = await Post.findById(postId)
      .populate("likes", "name username avatar")
      .lean();

    if (!post) {
      return res.status(404).json({ message: "No post found" });
    }

    const followings = user.following.map(id => id.toString());

    const likesInfo = post.likes.map(like => ({
      _id: like._id,
      name: like.name,
      username: like.username,
      avatar: like.avatar,
      isFollowedByMe: followings.includes(like._id.toString())
    }));

    return res.status(200).json({ likesInfo });
  } catch (error) {
    
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export default getLikesOfPost;
