import Post from "../../models/post.js";
import User from "../../models/User.js";

// 🔁 Recursive function to trace the original post
const findOriginalPost = async (postId) => {
  const post = await Post.findById(postId).select("sharedFrom");
  if (!post) return null;
  return post.sharedFrom ? findOriginalPost(post.sharedFrom) : post;
};

const sharePost = async (req, res) => {
  try {
    const { postId } = req.params;
    const { caption, taggedUsers = [], location, visibility } = req.body;
    const { user } = req;

    //  Get the very original post (not just the shared one)
    const originalPost = await findOriginalPost(postId);
    if (!originalPost) {
      return res.status(404).json({ message: "Original post not found" });
    }

    //  Load original post with trip info
    const original = await Post.findById(originalPost._id)
      .select("tripId visibility")
      .populate("tripId", "visibility");

    const isPublic =
      original?.visibility === "public" ||
      (original?.tripId && original.tripId.visibility === "public");

    if (!isPublic) {
      return res.status(403).json({
        message: "Only public posts or posts from public trips can be shared",
      });
    }

    //  Filter valid tagged users (must be in following)
    const followingIds = user.following.map((id) => id.toString());
    const validTaggedUsers = Array.isArray(taggedUsers)
      ? taggedUsers.filter((id) => {
          const idStr = id.toString();
          return idStr !== user._id.toString() && followingIds.includes(idStr);
        })
      : [];

    //  Hashtags and Mentions
    let hashtags = [];
    let mentionedUsersId = [];

    if (caption) {
      const words = caption.split(" ");

      hashtags = words
        .filter((word) => word.startsWith("#"))
        .map((tag) => tag.slice(1).trim().toLowerCase())
        .filter((tag) => tag.length > 0);

      const mentionedUsernames = words
        .filter((word) => word.startsWith("@"))
        .map((s) => s.slice(1).trim());

      if (mentionedUsernames.length > 0) {
        const mentionedUsers = await User.find({
          username: { $in: mentionedUsernames },
        }).select("_id");
        mentionedUsersId = mentionedUsers.map((u) => u._id);
      }
    }

    //  Create the shared post
    const newPost = await Post.create({
      author: user._id,
      caption: caption?.trim() || undefined,
      hashtags: hashtags.length > 0 ? hashtags : undefined,
      mentions: mentionedUsersId.length > 0 ? mentionedUsersId : undefined,
      taggedUsers: validTaggedUsers.length > 0 ? validTaggedUsers : [],
      sharedFrom: original._id,
      location: location || undefined,
      visibility: ["public", "followers", "close_friends", "private"].includes(visibility)
        ? visibility
        : "public", // default fallback
    });

    return res.status(201).json({
      message: "Post shared successfully",
      post: newPost,
    });
  } catch (error) {
    console.error(" Error sharing post:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default sharePost;
