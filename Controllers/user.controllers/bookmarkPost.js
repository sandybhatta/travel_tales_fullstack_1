import User from "../../models/User.js";
import Post from "../../models/post.js";

const bookmarkPost = async (req, res) => {
  const { postId } = req.params;
  const userId = req.user._id;

  try {
    //  Check if post exists
    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    //  Check if already bookmarked
    const isBookmarked = req.user.bookmarks?.some(
      (id) => id.toString() === postId.toString()
    );

    if (isBookmarked) {
      //  Unbookmark
      await Promise.all([
        User.findByIdAndUpdate(userId, { $pull: { bookmarks: postId } }),
        Post.findByIdAndUpdate(postId, { $pull: { bookmarkedBy: userId } }),
      ]);

      return res
        .status(200)
        .json({ message: "Post removed from your bookmarks", bookmarked: false });
    } else {
      // ✅ Bookmark
      await Promise.all([
        User.findByIdAndUpdate(userId, { $addToSet: { bookmarks: postId } }),
        
        Post.findByIdAndUpdate(postId, { $addToSet: { bookmarkedBy: userId } }),
      ]);

      return res
        .status(200)
        .json({ message: "Post added to your bookmarks", bookmarked: true });
    }
  } catch (error) {
    console.error("Bookmark error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default bookmarkPost;
