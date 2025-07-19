import Post from "../../models/post.js";
import { uploadToCloudinary } from "../../utils/cloudinary.js";

const createPost = async (req, res) => {
  try {
    const { user } = req;
    const { caption, taggedUsers = [], tripId, location } = req.body;

    if (!caption && (!req.files || req.files.length === 0)) {
      return res.status(400).json({ message: "Post must have either caption or media." });
    }

    // Upload media to Cloudinary
    const media = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const resource_type = file.mimetype.startsWith("video") ? "video" : "image";
        const result = await uploadToCloudinary(file.buffer, "posts", resource_type);
        media.push({
          url: result.secure_url,
          public_id: result.public_id,
          resource_type: result.resource_type,
        });
      }
    }

    // Validate taggedUsers (must be in user's following list)
    const followingIds = user.following.map(id => id.toString());
    const validTaggedUsers = Array.isArray(taggedUsers)
      ? taggedUsers.filter(id => followingIds.includes(id.toString()))
      : [];

    // Extract hashtags from caption
    let hashtags = [];
    if (caption) {
      hashtags = caption
        .split(" ")
        .filter(word => word.startsWith("#"))
        .map(tag => tag.slice(1).trim().toLowerCase())
        .filter(tag => tag.length > 0);
    }

    // Create post
    const newPost = await Post.create({
      author: user._id,
      caption,
      hashtags,
      media,
      trip: tripId || null,
      taggedUsers: validTaggedUsers,
      location:location?location:undefined
    });

    res.status(201).json({ message: "Post created", post: newPost });
  } catch (err) {
    console.error("Post creation failed:", err);
    res.status(500).json({ message: "Server error while creating post" });
  }
};

export default createPost;
