import mongoose from "mongoose";

const tripSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
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
      public_id: String,
      url: String,
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
        coordinates: {
          lat: Number,
          lng: Number,
        },
      },
    ],
    posts: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Post",
      },
    ],
    visibility: {
        type: String,
        enum: ["public", "followers", "close_friends"],
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
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
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
  

// is the trip ended in past
tripSchema.virtual("isPast").get(function () {
    if (!this.endDate) return false;
  
    const today = new Date();
    // Remove time portion for date-only comparison
    today.setHours(0, 0, 0, 0);
  
    const tripEndDate = new Date(this.endDate);
    tripEndDate.setHours(0, 0, 0, 0);
  
    return tripEndDate < today;
  });

// is the trip ongoing
tripSchema.virtual("isOngoing").get(function () {
    if (!this.startDate || !this.endDate) return false;
  
    const today = new Date();
    // Remove time portion for date-only comparison
    today.setHours(0, 0, 0, 0);
  
    const tripStartDate = new Date(this.startDate);
    tripStartDate.setHours(0, 0, 0, 0);
  
    const tripEndDate = new Date(this.endDate);
    tripEndDate.setHours(0, 0, 0, 0);
  
    return tripStartDate <= today && tripEndDate >= today;
  });

  //is the trip upcoming
tripSchema.virtual("isUpcoming").get(function () {
    if (!this.startDate) return false;
  
    const today = new Date();
    // Remove time portion for date-only comparison
    today.setHours(0, 0, 0, 0);
  
    const tripStartDate = new Date(this.startDate);
    tripStartDate.setHours(0, 0, 0, 0);
  
    return tripStartDate > today;
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
    return this.acceptedFriends.some(
      (friendId) => friendId.toString() === userId.toString()
    );
  }; 
  
  


// who can view 
tripSchema.methods.canView = async function (user) {
    // If public, anyone can view
    if (this.visibility === "public") return true;
  
    // If no user is logged in
    if (!user) return false;
  
    // If user is the trip owner
    if (this.user.toString() === user._id.toString()) return true;
  
    // Populate the owner's followers and closeFriends only if needed
    const TripOwner = await mongoose.model("User").findById(this.user)
      .select("followers closeFriends")
      .lean();
  
    if (this.visibility === "followers") {
      return TripOwner.followers.some(
        (followerId) => followerId.toString() === user._id.toString()
      );
    }
  
    if (this.visibility === "close_friends") {
      return TripOwner.closeFriends.some(
        (friendId) => friendId.toString() === user._id.toString()
      );
    }
  
    return false; // fallback
  };



// who can post in the trip
tripSchema.methods.canPost = function (user) {
    if (!user || !user._id) return false;
  
    const userId = user._id.toString();
    const ownerId = this.user.toString();
  
    // Check if the user is the trip owner
    if (userId === ownerId) return true;
  
    // Check if user is in accepted friends
    return this.acceptedFriends.some(
      friendId => friendId.toString() === userId
    );
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

const Trip= mongoose.model("Trip", tripSchema);
export default Trip;