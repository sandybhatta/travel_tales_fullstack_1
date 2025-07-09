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
    const isLiked = trip.likes.some((id) => id.toString() === user._id.toString());

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

    // Populate posts, user, and acceptedFriends
    await trip.populate([
      { path: "user", select: "name username avatar" },
      { path: "acceptedFriends.user", select: "name username avatar" },
      { path: "posts.addedBy", select: "name username avatar" },
      {
        path: "posts.post",
        populate: [
          { path: "author", select: "name username avatar" },
          { path: "likes", select: "_id" },
          { path: "comments", select: "_id" },
        ],
      },
    ]);

    const posts = trip.posts.map(({ post, addedBy, addedAt, captionOverride, dayNumber, boosted, highlightedBy }) => {
      const likeCount = post.likes.length;
      const commentCount = post.comments.length;
      const isLikedByCurrentUser = post.likes.some((id) => id.toString() === user._id.toString());
      const isPostedByOwner = trip.user._id.toString() === post.author._id.toString();
      return {
        ...post.toObject(),
        addedBy,
        addedAt,
        captionOverride,
        dayNumber,
        boosted,
        highlightedBy,
        likeCount,
        commentCount,
        isLikedByCurrentUser,
        isPostedByOwner,
      };
    });

    const itinerary = posts.reduce((acc, post) => {
      if (!post.dayNumber) return acc;
      if (!acc[post.dayNumber]) acc[post.dayNumber] = [];
      acc[post.dayNumber].push(post);
      return acc;
    }, {});

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
      totalLikes: trip.likes.length,
      totalComments: trip.totalComments,
      tags: trip.tags,
      isArchived: trip.isArchived,
      isCompleted: trip.isCompleted,
      itinerary,
    };

    if (currentUserFlags.canAccessPrivateData) {
      const notes = [...trip.notes].sort((a, b) => (a.isPinned === b.isPinned ? new Date(b.createdAt) - new Date(a.createdAt) : a.isPinned ? -1 : 1));
      const todos = [...trip.todoList].sort((a, b) => new Date((a.dueDate || a.createdAt)) - new Date((b.dueDate || b.createdAt)));
      const expenses = [...trip.expenses].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

      const totalSpent = expenses.reduce((acc, curr) => acc + curr.amount, 0);
      const totalTasks = todos.length;
      const completedTasks = todos.filter(t => t.done).length;

      tripData.travelBudget = trip.travelBudget;
      tripData.totalSpent = totalSpent;
      tripData.notes = notes;
      tripData.todos = todos;
      tripData.expenses = expenses;
      tripData.taskStats = { totalTasks, completedTasks };
    }

    // (Optional) Liked by user's followings for frontend badge
    const userDoc = await User.findById(user._id).select("following").lean();
    const likedByFollowings = trip.likes.filter(id => userDoc.following?.includes(id.toString()));
    tripData.likedByFollowings = likedByFollowings;

    res.status(200).json({ trip: tripData });

  } catch (error) {
    console.error("Error fetching trip by ID:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export default getTripById;
