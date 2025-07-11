import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
     
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    // Type of action triggering the notification
    type: {
      type: String,
      enum: [
        "comment",
        "reply",
        "like_post",
        "like_comment",
        "mention_post",
        "mention_comment",
        "trip_invite",
        "trip_accept",
        "follow",
        "system", // generic announcements
      ],
      required: true,
    },

    // Optional: ID of the target object related to this notification
    post: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Post",
    },
    comment: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Comment",
    },
    trip: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Trip",
    },

    // Optional message for system / email notifications
    message: {
      type: String,
      trim: true,
    },

    // Link where user should be taken when clicking the notification
    targetUrl: {
      type: String,
      trim: true,
    },

    // Flags for status
    isRead: {
      type: Boolean,
      default: false,
    },
    isEmailSent: {
      type: Boolean,
      default: false,
    },
    emailSentAt: {
      type: Date,
    },

    // Expiry for system or temporary notifications (optional)
    expiresAt: {
      type: Date,
      default: null,
    },

    // For future push/SSE/WebSocket support
    deliveryChannels: {
      type: [String], // e.g., ["email", "socket"]
      default: ["email"],
    },
  },
  {
    timestamps: true,
  }
);

// Auto-delete expired notifications (if needed)
notificationSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });




const Notification = mongoose.model("Notification", notificationSchema);
export default Notification;
