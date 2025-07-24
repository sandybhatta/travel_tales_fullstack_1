import Post from "../../models/post.js";

const postsLikedByUser = async (req, res) => {
  try {
    const { user } = req;
    const page = parseInt(req.query.page);
    const limit = 20;
    const skip = (page-1)*limit

    const posts = await Post.find({ likes: user._id })
      .populate({
        path: "author",
        select: "name username avatar"
      })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit) 

    if (posts.length === 0) {
      return res.status(200).json({
        message: "No liked posts found",
        postEmpty: true,
        posts: [],
      });
    }

    return res.status(200).json({ 
        posts,
        hasMorePosts:posts.length === limit
     });
  } catch (error) {
    console.error("Error in postsLikedByUser:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export default postsLikedByUser;
