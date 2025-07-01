import mongoose from "mongoose";
import crypto from "crypto";
import bcrypt from "bcrypt"

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    username: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      minLength:3
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: true, // Will skip for OAuth users
      select: false, // Don't return password by default
    },
    avatar: {
      type: String,
      default: "https://cdn-icons-png.flaticon.com/512/149/149071.png",
    },
    bio: {
      type: String,
      maxlength: 300,
      default: "",
    },
    location: {
        city: { type: String, required: true },
        state: { type: String, required: true },
        country: { type: String, required: true },
    },
    

    // 🧑‍🤝‍🧑 Followers / Following
    followers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    following: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    closeFriends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    // saved post for the user
    bookmarks: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Post",
        }
      ],

    // 👑 Roles (Admin, User, etc.)
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },

    // 🏅 Badges for Gamification
    badges: [
      {
        type: String, // e.g. "city_hopper", "mountain_master"
      },
    ],

    // 🎮 XP & Level System
    xp: {
      type: Number,
      default: 0,
    },
    level: {
      type: Number,
      default: 1,
    },

  
   

    // 🕓 Last Login
  lastLogin: {
      type: Date,
    },  

    // ⚙️ Account settings
    isVerified: {
      type: Boolean,
      default: false,
    },


    // Store a *hashed* token so the raw value never lives in DB
    emailVerifyToken: String,

    // Optional expiry (ISO date). TTL index removes stale docs automatically.
    emailVerifyTokenExpires: Date,
    
    
    isBanned: {
      type: Boolean,
      default: false,
    },

    isDeactivated: {
      type: Boolean,
      default: false,
    },
    deactivationReason:{
      type:String,
      
    },
    deactivatedDate:{
      type:Date
    },


    // for extra features 

    privacy: {
      profileVisibility: {
        type: String,
        enum: ["public", "followers", "private"],
        default: "public",
      },
      allowComments: {
        type: String,
        enum: ["everyone", "followers", "close_friends", "no_one"],
        default: "everyone",
      },
    },

    blockedUsers: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],

      // building this model
    interests: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Interest",
      }
    ]
  },







  {
    timestamps: true, 
  }
);


// indexing for frequest search
userSchema.index({ username: 1 });
userSchema.index({ email: 1 });
userSchema.index({ followers: 1 });
userSchema.index({ following: 1 });




userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next(); // only hash if password is changed
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  });

  userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  };


  // for notifications
 /**
 * Generates a random raw token, hashes & stores it,
 * sets expiry, and returns the raw token for e-mailing.
 */
userSchema.methods.createEmailVerificationToken = function () {
  const rawToken = crypto.randomBytes(32).toString("hex"); // 64-char string
  this.emailVerifyToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");

  // 30 min lifetime (adjust to taste)
  this.emailVerifyTokenExpires = Date.now() + 30 * 60 * 1000;

  return rawToken;
};

  
const User = mongoose.model("User", userSchema);

export default User;
