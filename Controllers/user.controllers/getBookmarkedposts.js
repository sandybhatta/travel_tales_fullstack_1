import Post from "../../models/post.js";

const getBookmarkedPosts = async (req, res) => {
  const { user } = req;

  try {
    const bookmarkedPosts = await Post.find({ _id: { $in: user.bookmarks } })
      .sort({ createdAt: -1 }) // optional: latest first
      .populate([
        {
          path: "author",
          select: "name username avatar",
        },
        {
          path: "likes",
          select: "username avatar",
        },
        {
          path: "comments",
          populate: [
            {
              path: "author",
              select: "name username",
            },
            {
              path: "likes",
              select: "name username",
            },
          ],
        },
      ])
      .lean(); // optional for performance

    return res.status(200).json(bookmarkedPosts);
  } catch (error) {
    console.error("Error fetching bookmarked posts:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default getBookmarkedPosts;
