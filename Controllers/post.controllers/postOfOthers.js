import Post from "../../models/post.js";
import User from "../../models/User.js";

const postOfOthers = async (req, res) => {
  try {
    const { user } = req;
    const { userId } = req.params;

    const anotherUser = await User.findById(userId);
    if (!anotherUser) {
      return res.status(404).json({ message: "No user found" });
    }

    const posts = await Post.find({ author: userId })
      .populate([
        {
          path: "author",
          select: "name username avatar",
        },
        {
          path: "taggedUsers",
          select: "name username avatar",
        },
        {
          path: "likes",
          select: "_id",
        },
        {
          path: "comments",
          options: { limit: 2 },
          populate: {
            path: "author",
            select: "name username avatar",
          },
        },
        {
          path: "tripId",
          select: "visibility",
        },
      ]);

    const followingIds = user.following.map((u) => u._id.toString());
    const closeFriendIds = anotherUser.closeFriends.map((u) => u._id.toString());

    const filteredPosts = [];

    for (let post of posts) {
      if (post.tripId) {
        const visibility = post.tripId.visibility || "public";

        if (visibility === "followers") {
          if (followingIds.includes(userId)) {
            filteredPosts.push(post);
          }
        } else if (visibility === "close_friends") {
          if (closeFriendIds.includes(user._id.toString())) {
            filteredPosts.push(post);
          }
        } else if (visibility === "private") {
          if (user._id.toString() === userId) {
            filteredPosts.push(post);
          }
        } else {
          filteredPosts.push(post); // public
        }
      } else {
        const visibility = post.visibility || "public";

        if (visibility === "followers") {
          if (followingIds.includes(userId)) {
            filteredPosts.push(post);
          }
        } else if (visibility === "close_friends") {
          if (closeFriendIds.includes(user._id.toString())) {
            filteredPosts.push(post);
          }
        } else if (visibility === "private") {
          if (user._id.toString() === userId) {
            filteredPosts.push(post);
          }
        } else {
          filteredPosts.push(post); // public
        }
      }
    }

    return res.status(200).json({ post: filteredPosts });
  } catch (error) {
    console.error("Error in postOfOthers:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export default postOfOthers;
