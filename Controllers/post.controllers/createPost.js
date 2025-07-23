import Post from "../../models/post.js";
import { uploadToCloudinary } from "../../utils/cloudinary.js";
import Trip from "../../models/trip.js"
import User from "../../models/User.js"

const createPost = async (req, res) => {
  try {
    const { user } = req;
    const { caption, taggedUsers = [], tripId, location ,visibility} = req.body;

    if (!caption && (!req.files || req.files.length === 0)) {
      return res.status(400).json({ message: "Post must have either caption or media." });
    }

    // Upload media to Cloudinary
    const media = [];
    if (req.files && req.files.length > 0) {
      for (const file of req.files) {
        const resource_type = file.mimetype.startsWith("video") ? "video" : "image";
        const result = await uploadToCloudinary(file.buffer, `posts/${user._id}`, resource_type);
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
  ? taggedUsers.filter(id => {
      const idStr = id.toString();
      return idStr !== user._id.toString() && followingIds.includes(idStr);
    })
  : [];

    // Extract hashtags & mentions from caption
    let hashtags = [];
    let mentionedUsersId=[];

    if (caption) {
      hashtags = caption
        .split(" ")
        .filter(word => word.startsWith("#"))
        .map(tag => tag.slice(1).trim().toLowerCase())
        .filter(tag => tag.length > 0);

      // extract names
        const mentionedUserNames= caption
        .split(" ")
        .filter(s=>s.startsWith('@'))
        .map(s=>s.slice(1).trim().toLowerCase())


        if(mentionedUserNames.length>0){
          let mentionedUsers = await User.find({
            username:{$in:mentionedUserNames}
          }).select("_id")
          mentionedUsersId=mentionedUsers.map(user=>user._id)
        }
    }


    let postVisibility;

    if(tripId){
      const trip = await Trip.findById(tripId);
      if(!trip || !trip.canPost(user)){
        return res.status(403).json({ message: "You cannot post to this trip." });
      } 
      postVisibility=trip.visibility
    }



const allowedVisibility = ["public", "followers", "close_friends","private"]
    // Create post
    const newPost = await Post.create({
      author: user._id,
      caption:caption?caption.trim():undefined,
      hashtags,
      media,
      visibility:postVisibility?postVisibility : allowedVisibility.includes(visibility)? visibility:undefined,
      trip: tripId || null,
      taggedUsers: validTaggedUsers,
      location:location?location:undefined,
      mentions:mentionedUsersId?.length>0?mentionedUsersId : undefined
    });

    res.status(201).json({ message: "Post created", post: newPost });
  } catch (err) {
    console.error("Post creation failed:", err);
    res.status(500).json({ message: "Server error while creating post" });
  }
};

export default createPost;
