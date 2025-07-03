import mongoose from "mongoose";

const postSchema = new mongoose.Schema(
  {
    // 👤 Post Author
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // 📝 Caption
    caption: {
      type: String,
      maxlength: 1000,
    },

    // 🏷️ Hashtags
    hashtags: [
      {
        type: String,
        lowercase: true,
        trim: true,
      },
    ],

    // 📍 Location Info
    location: {
      city: String,
      state: String,
      country: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },

    // 🖼️ Media (Images / Videos via Cloudinary)
    media: [
      {
        public_id: String, // for Cloudinary deletion
        url: String,
        type: {
          type: String,
          enum: ["image", "video"],
          default: "image",
        },
      },
    ],

    // ❤️ Likes
    likes: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // 💬 Comments (via ref)
    comments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Comment",
      },
    ],

    // 🔁 Shared Post Ref
    sharedFrom: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
      default: null,
    },

    // 🔒 Privacy Options
    visibility: {
      type: String,
      enum: ["public", "followers", "close_friends","private"],
      default: "public",
    },

    // 🔖 Bookmarked By
    bookmarkedBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

    // 🏞️ Trip Info (Optional)
    tripId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip", // when posted as part of itinerary
    },

    // 🗓️ Travel Date (optional, not post date)
    travelDate: {
      type: Date,
    },

    // 🏅 XP Boost or Featured tag
    isFeatured: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, // createdAt, updatedAt
  }
);

postSchema.pre("deleteOne", { document: true }, async function (next) {
    const postId = this._id;
  
    // Delete related comments
    await mongoose.model("Comment").deleteMany({ post: postId });
  
    // Remove post from user bookmarks
    await mongoose.model("User").updateMany(
      { bookmarks: postId },
      { $pull: { bookmarks: postId } }
    );
  
    // Remove sharedFrom references
    await mongoose.model("Post").updateMany(
      { sharedFrom: postId },
      { sharedFrom: null }
    );
  
    // Delete media from Cloudinary
    // for (let file of this.media) {
    //   if (file.public_id) {
    //     await cloudinary.uploader.destroy(file.public_id);
    //   }
    // }
  
    next();
  });
  


//to show true or false if the post is liked by the user
  postSchema.methods.isLikedBy = function (userId) {
    return this.likes.some(id => id.toString() === userId.toString());
  };
  
//to show true or false if the post is bookmarked by the user
postSchema.methods.isBookmarkedBy = function (userId) {
    return this.bookmarkedBy.some(id => id.toString() === userId.toString());
  };

// to toggle like and unlike functionality
postSchema.methods.toggleLike = function (userId) {
    if (this.isLikedBy(userId)) {
      this.likes.pull(userId);
    } else {
      this.likes.push(userId);
    }
    return this.save();
  };


//to populate sharedfrom field with the original post details
postSchema.methods.populateSharedFrom = async function () {
    return await this.populate("sharedFrom");
  };
  
  

const Post = mongoose.model("Post", postSchema);

export default Post;
