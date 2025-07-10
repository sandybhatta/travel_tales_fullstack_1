import Trip from "../../models/trip.js";
import User from "../../models/User.js";

const getTripById = async (req, res) => {
  const { user } = req;
  const { tripId } = req.params;

  try {
    if (!tripId) return res.status(400).json({ message: "Invalid trip ID" });

    const trip = await Trip.findById(tripId);
    if (!trip) return res.status(404).json({ message: "Trip not found" });

    const canView = await trip.canView(user);
    if (!canView) return res.status(403).json({ message: "You are not allowed to view this trip" });

    const isOwner = trip.isOwnedBy(user._id);
    const isCollaborator = trip.isFriendAccepted(user._id);
    const isLiked = trip.likes?.some((id) => id.toString() === user._id.toString());

    const currentUserFlags = {
      isOwner,
      isCollaborator,
      isInvited: trip.isFriendInvited(user._id),
      isLiked,
      canAddPost: trip.canPost(user),
      canEditTrip: isOwner,
      canInviteFriends: isOwner,
      canAccessPrivateData: isOwner || isCollaborator,
    };

    // Populate all necessary references
    await trip.populate([
      { path: "user", select: "name username avatar" },
      { path: "acceptedFriends.user", select: "name username avatar" },
      { path: "posts.addedBy", select: "name username avatar" },
      { path: "expenses.spentBy", select: "name username avatar" },
      { path: "notes.createdBy", select: "name username avatar" },
      { path: "todoList.createdBy", select: "name username avatar" },
      { path: "todoList.assignedTo", select: "name username avatar" },
      {
        path: "posts.post",
        populate: [
          { path: "author", select: "name username avatar" },
          { path: "likes", select: "_id" },
          { path: "comments", select: "_id" },
        ],
      },
    ]);

    // Process posts
    const posts = await Promise.all(
      trip.posts.map(async ({ post, addedBy, addedAt, captionOverride, dayNumber, boosted, isHighlighted, highlightedBy }) => {
        const likeCount = post.likes?.length || 0;
        const commentCount = post.comments?.length || 0;

        const isLikedByCurrentUser = post.likes.some((id) => id.toString() === user._id.toString());
        const isPostedByOwner = trip.user._id.toString() === post.author._id.toString();

        let highlightedByUser = null;
        if (isHighlighted && highlightedBy) {
          highlightedByUser = await User.findById(highlightedBy).select("name username avatar");
        }

        return {
          ...post.toObject(),
          addedBy,
          addedAt,
          captionOverride,
          dayNumber,
          boosted,
          isBoosted: boosted,
          isHighlighted,
          highlightedBy: highlightedByUser,
          likeCount,
          commentCount,
          isLikedByCurrentUser,
          isPostedByOwner,
        };
      })
    );

    // Group by itinerary days
    const itinerary = posts.reduce((acc, post) => {
      if (!post.dayNumber) return acc;
      if (!acc[post.dayNumber]) acc[post.dayNumber] = [];
      acc[post.dayNumber].push(post);
      return acc;
    }, {});

    // Prepare main trip data object
    const tripData = {
      ...trip.toObject(),
      virtuals: {
        tripStatus: trip.tripStatus,
        duration: trip.duration,
        durationText: trip.durationText,
        postCount: trip.postCount,
        destinationCount: trip.destinationCount,
        isCollaborative: trip.isCollaborative,
      },
      currentUser: currentUserFlags,
      totalLikes: trip.likes?.length || 0,
      totalComments: trip.totalComments || 0,
      tags: trip.tags || [],
      isArchived: trip.isArchived || false,
      isCompleted: trip.isCompleted || false,
      isOngoing: trip.tripStatus === "ongoing",
      isUpcoming: trip.tripStatus === "upcoming",
      isPast: trip.tripStatus === "past",
      itinerary,
      timelineView: Object.entries(itinerary).map(([dayNumber, posts]) => ({
        dayNumber: Number(dayNumber),
        posts,
      })),
    };

    // Add private data for owner or collaborators
    if (currentUserFlags.canAccessPrivateData) {
      const notes = [...trip.notes].sort((a, b) => {
        if (a.isPinned === b.isPinned) return new Date(b.createdAt) - new Date(a.createdAt);
        return a.isPinned ? -1 : 1;
      });

      const todos = [...trip.todoList].sort((a, b) => new Date((a.dueDate || a.createdAt)) - new Date((b.dueDate || b.createdAt)));
      const expenses = [...trip.expenses].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);
      const totalTasks = todos.length;
      const completedTasks = todos.filter((t) => t.done).length;

      tripData.travelBudget = trip.travelBudget || 0;
      tripData.totalSpent = totalSpent;
      tripData.notes = notes;
      tripData.todos = todos;
      tripData.expenses = expenses;
      tripData.taskStats = { totalTasks, completedTasks };
    }

    // Liked by followings
    const userDoc = await User.findById(user._id).select("following").populate("following", "name username avatar").lean();
    const likesOfTrip = trip.likes?.map((id) => id.toString()) || [];
    const likedByFollowings = userDoc.following.filter((f) => likesOfTrip.includes(f._id.toString()));

    tripData.likedByFollowings = likedByFollowings;
    tripData.likedByFollowingsPreview = likedByFollowings.slice(0, 5);
    tripData.totalLikedByFollowings = likedByFollowings.length;

    // Pending invites if owner
    if (isOwner) {
      const pendingInvites = await User.find({
        _id: { $in: trip.invitedFriends || [] },
      }).select("name username avatar");
      tripData.pendingInvites = pendingInvites;
    }

    // Engagement summary
    tripData.engagement = {
      totalLikes: trip.likes?.length || 0,
      totalComments: trip.totalComments || 0,
      totalPosts: trip.posts.length,
      totalTasks: tripData.taskStats?.totalTasks || 0,
      completedTasks: tripData.taskStats?.completedTasks || 0,
      collaboratorCount: trip.acceptedFriends?.length || 0,
    };

    res.status(200).json({ trip: tripData });

  } catch (error) {
    console.error("Error fetching trip by ID:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export default getTripById;
