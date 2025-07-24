
import Post from "../../models/post.js";
import Trip from "../../models/trip.js";
import User from "../../models/User.js";

const editPost = async (req, res) => {
  try {
    const { caption, location, visibility, tripId } = req.body;
    const { user } = req;
    const { postId } = req.params;

    const post = await Post.findById(postId);
    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    if (post.author.toString() !== user._id.toString()) {
      return res.status(403).json({ message: "Only the post owner can edit" });
    }

    if (tripId) {
      

      if (post.tripId?.toString() === tripId.toString()) {
        return res.status(400).json({ message: "This post already belongs to that trip" });
      }

      const trip = await Trip.findById(tripId);
      if (!trip) {
        return res.status(404).json({ message: "Trip not found" });
      }

      const canPost = trip.canPost(user);
      if (!canPost) {
        return res.status(403).json({ message: "You are neither the owner nor a collaborator of that trip" });
      }

      post.tripId = trip._id;
      post.visibility = trip.visibility;
    }

    if (!post.tripId && visibility && ["public", "followers", "close_friends", "private"].includes(visibility)) {
      post.visibility = visibility;
    }

    let mentions = [];
    let hashtags = [];

    if (caption) {
      // Extract mentions
      const mentionNames = caption
        .split(" ")
        .filter(word => word.startsWith("@"))
        .map(word => word.slice(1).trim().toLowerCase());

      if (mentionNames.length > 0) {
        const mentionedUsers = await User.find({
          username: { $in: mentionNames },
        }).select("_id");
        mentions = [...new Set(mentionedUsers.map(user => user._id.toString()))];
      }

      // Extract hashtags
      hashtags = caption
        .split(" ")
        .filter(word => word.startsWith("#"))
        .map(word => word.slice(1).trim().toLowerCase())
        .filter(tag => tag.length > 0);

      hashtags = [...new Set(hashtags)];

      post.caption = caption;
      post.mentions = mentions;
      post.hashtags = hashtags;
    }

    if (location) {
      post.location = location;
    }

    await post.save();

    return res.status(200).json({ message: "Post modified successfully", post });
  } catch (error) {
    console.error("Edit post error:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export default editPost;
