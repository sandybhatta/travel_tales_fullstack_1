import mongoose from "mongoose";

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
        city: String,
        state: String,
        country: String,
        required:true,
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
    isBanned: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true, 
  }
);
userSchema.pre("save", async function (next) {
    if (!this.isModified("password")) return next(); // only hash if password is changed
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  });

  userSchema.methods.comparePassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
  };
  
const User = mongoose.model("User", userSchema);

export default User;
