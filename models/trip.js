import mongoose from "mongoose";

const tripSchema = new mongoose.Schema({
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    tags: [
      {
        type: String,
        enum: [
          "adventure",
          "beach",
          "mountains",
          "history",
          "food",
          "wildlife",
          "culture",
          "luxury",
          "budget",
          "road_trip",
          "solo",
          "group",
          "trekking",
          "spiritual",
          "nature",
          "photography",
          "festivals",
          "architecture",
          "offbeat",
          "shopping",
        ],
        trim: true,
        lowercase: true,
      },
    ],

    isArchived: { type: Boolean, default: false },

    totalLikes: { type: Number, default: 0 },
    
    totalComments: { type: Number, default: 0 },



    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 100,
    },
    description: {
      type: String,
      trim: true,
      maxlength: 1000,
    },
    coverPhoto: {
        public_id: { type: String, trim: true },
        url: { type: String, trim: true },
      },
      
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    destinations: [
      {
        city: String,
        state: String,
        country: String,
        
      },
    ],

    travelBudget: { type: Number, default: 0 },

    expenses: [
      {
        title: {
          type:String,
          required:true
        },
        amount: {
          type:Number,
          required:true
        },
        spentBy: { 
          type: mongoose.Schema.Types.ObjectId, 
          ref: "User" 
        },
        createdAt: { type: Date, default: Date.now }
      }
    ],

    notes: [
      {
        body: { 
          type: String,
           required: true, 
           trim: true 
          },
        createdAt: { 
          type: Date, 
          default: Date.now 
        },
        createdBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User", 
        },
        isPinned: { type: Boolean, default: false }, // helpful for highlighting
      }
    ],

    todoList: [
      {
        task: { 
          type: String,
          required: true,
          trim: true 
        },
        done: {
          type: Boolean,
          default: false 
        },
        dueDate: Date,
        createdBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
        assignedTo: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      }
    ],

    posts: [
    {
        post: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Post",
          required: true,
        },
        addedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        addedAt: {
          type: Date,
          default: Date.now,
        },
        captionOverride: {
          type: String,
          trim: true,
          maxlength: 1000,
        },
        dayNumber: {
          type: Number, // e.g., Day 1, Day 2 of the trip
          min: 1,
        },
        
        isHighlighted: {
          type: Boolean,
          default: false,
        },
        highlightedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User", // usually trip owner
          default: null,
        },
    }
],
    likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],

    isCompleted: { type: Boolean, default: false },

    visibility: {
        type: String,
        enum: ["public", "followers", "close_friends","private"],
        default: "public",
      },
    invitedFriends: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    acceptedFriends: [
        {
          user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
          acceptedAt: { type: Date, default: Date.now },
        }
      ]
      
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

//to get the duration of the trip in days
tripSchema.virtual("duration").get(function () {
    if (!this.startDate || !this.endDate) return 0;
  
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
  
    const durationMs = end - start; // Difference in milliseconds
    const durationDays = Math.ceil(durationMs / (1000 * 60 * 60 * 24)); // Convert to days
  
    return durationDays;
  });
  // to get the duration days in human readable text
tripSchema.virtual("durationText").get(function () {
    const duration = this.duration;
    if (duration === 0) return "0 days";
    if (duration === 1) return "1 day";
    return `${duration} days`;
  });
  

// what is the trip status
tripSchema.virtual("tripStatus").get(function () {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
  
    const start = new Date(this.startDate);
    const end = new Date(this.endDate);
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);
  
    if (end < today) return "past";
    if (start > today) return "upcoming";
    return "ongoing";
  });
  

//   post count
tripSchema.virtual("postCount").get(function () {
    return this.posts?.length || 0;
  });
  
// destination count
tripSchema.virtual("destinationCount").get(function () {
    return this.destinations?.length || 0;
  });

// is the trip solo or collaborative
tripSchema.virtual("isCollaborative").get(function () {
    return this.acceptedFriends.length > 0;
  });
 
  


//    now instance methods







// for adding in todo list
tripSchema.methods.addTodo = function (userId, task, assignedTo, dueDate) {
  this.todoList.push({ task, createdBy: userId, assignedTo, dueDate });
  return this.save();
};


//toggling the todo list

tripSchema.methods.toggleTodo = function (todoId) {
  const todo = this.todoList.id(todoId);
  if (todo) todo.done = !todo.done;
  return this.save();
};




// is the trip owned by the user
tripSchema.methods.isOwnedBy = function (userId) {
    if (!userId) return false;
    return this.user.toString() === userId.toString();
  };


// is the frined invited to the trip
tripSchema.methods.isFriendInvited = function (userId) {
    return this.invitedFriends.some(
      (friendId) => friendId.toString() === userId.toString()
    );
  };
// is the friend accepted the trip invitation
tripSchema.methods.isFriendAccepted = function (userId) {
    return this.acceptedFriends?.some(
      (friend) => friend.user.toString() === userId.toString()
    );
  }; 
  
  


// who can view 
tripSchema.methods.canView = async function (user) {
    // If public, anyone can view
    if (this.visibility === "public") return true;
  
    // If no user is logged in
    if (!user) return false;
  
    // If user is the trip owner
    if (this.user.toString() === user._id.toString() || this.acceptedFriends?.some(friendObj => friendObj.user.toString() === user._id.toString())
    ) return true;
  
    // Populate the owner's followers and closeFriends only if needed
    const TripOwner = await mongoose.model("User").findById(this.user)
      .select("followers closeFriends")
      .lean();
  
    if (this.visibility === "followers") {
      return TripOwner.followers?.some(
        (followerId) => followerId.toString() === user._id.toString()
      );
    }
  
    if (this.visibility === "close_friends") {
      return TripOwner.closeFriends?.some(
        (friendId) => friendId.toString() === user._id.toString()
      );
    }
  
    return false; // fallback
  };



// who can post in the trip
tripSchema.methods.canPost = function (user) {
    if (!user) return false;
  
    const userId = user._id.toString();
    const ownerId = this.user.toString();
  
    // Check if the user is the trip owner
    if (userId === ownerId) return true;
  
    // Check if user is in accepted friends
    return this.acceptedFriends.some(
      friendId => friendId.toString() === userId
    );
  };
  

// to add a friend in invited
tripSchema.methods.inviteFriend = async function (userId) {
    if (!userId) throw new Error("User ID is required");
  
    const isAlreadyInvited = this.invitedFriends.some(
      (id) => id.toString() === userId.toString()
    );
    const isAlreadyAccepted = this.acceptedFriends.some(
      (id) => id.toString() === userId.toString()
    );
  
    if (!isAlreadyInvited && !isAlreadyAccepted) {
      this.invitedFriends.push(userId);
      await this.save();
    }
    console.log("Monkey d luffy")
  
  
  };

  // to accept a trip invitation and remove from invitedFriends
  tripSchema.methods.acceptInvitation = async function (userId) {
    if (!userId) throw new Error("User ID is required");
  
    const wasInvited = this.invitedFriends.some(
      (id) => id.toString() === userId.toString()
    );
    const alreadyAccepted = this.acceptedFriends.some(
      (id) => id.user.toString() === userId.toString()
    );
  
    if (wasInvited && !alreadyAccepted) {
      // Remove from invitedFriends
      this.invitedFriends = this.invitedFriends.filter(
        (id) => id.toString() !== userId.toString()
      );
  
      // Add to acceptedFriends
      this.acceptedFriends.push({
        user: userId,
        acceptedAt: new Date()
      });
  
      await this.save();
    }
  
    return this;
  };
  

  // now static nmethods

//   find trips by user
tripSchema.statics.getUserTrips = async function (userId) {
    if (!userId) throw new Error("User ID is required");
  
    return this.find({ user: userId }).sort({ createdAt: -1 });
  };


  // getting visisble trips for user
  tripSchema.statics.getVisibleTripsForUser = async function (userId) {
    if (!userId) throw new Error("User ID is required");
  
    const User = mongoose.model("User");
  
    // Fetch current user to get their following list
    const currentUser = await User.findById(userId)
      .select("following")
      .lean();
  
    const followingIds = currentUser?.following?.map((f) => f.toString()) || [];
  
    // Fetch all users who added this user to their closeFriends
    const closeFriendsOf = await User.find({
      closeFriends: userId,
    }).select("_id").lean();
  
    const closeFriendIds = closeFriendsOf.map(u => u._id.toString());
  
    return this.find({
      $or: [
        { user: userId }, // own trips
        { visibility: "public" },
        { visibility: "followers", user: { $in: followingIds } },
        { visibility: "close_friends", user: { $in: closeFriendIds } },
      ],
    }).sort({ createdAt: -1 });
  };
 
  

//   static method for getting collaborated trips
tripSchema.statics.getCollaboratedTrips = async function (userId) {
    if (!userId) throw new Error("User ID is required");
  
    return this.find({
      acceptedFriends: userId,
    }).sort({ createdAt: -1 });
  };


// get a specific trip with post details
tripSchema.statics.getTripWithPosts = async function (tripId) {
    if (!tripId) throw new Error("Trip ID is required");
  
    return this.findById(tripId)
      .select("-__v") // Optional: remove unwanted internal fields
      .populate({
        path: "posts",
        options: { sort: { createdAt: -1 } }, // Sort posts newest first
        populate: [
          {
            path: "author",
            select: "name username avatar", // Show post author info
          },
          {
            path: "comments",
            select: "_id", // To show comment count if needed
          },
        ],
      })
      .lean(); // Return plain JS object (faster, lightweight)
  };

// get users who have upcoming trip
tripSchema.statics.getUpcomingTrips = async function (userId) {
    if (!userId) throw new Error("User ID is required");
  
    const today = new Date();
  
    return this.find({
      user: userId,
      startDate: { $gt: today },
    }).sort({ startDate: 1 }).lean();
  };
// users who is having ongoing trip
tripSchema.statics.getOngoingTrips = async function (userId) {
    if (!userId) throw new Error("User ID is required");
  
    const today = new Date();
  
    return this.find({
      user: userId,
      startDate: { $lte: today },
      endDate: { $gte: today },
    }).sort({ startDate: 1 }).lean();
  };
  
  //users who have completed their trips
tripSchema.statics.getPastTrips = async function (userId) {
    if (!userId) throw new Error("User ID is required");
  
    const today = new Date();
  
    return this.find({
      user: userId,
      endDate: { $lt: today },
    }).sort({ endDate: -1 }).lean();
  };

  

const Trip= mongoose.model("Trip", tripSchema);
export default Trip;