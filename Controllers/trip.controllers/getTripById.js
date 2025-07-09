import Trip from "../../models/trip.js";
import User from "../../models/User.js";

const getTripById = async (req, res) => {
  const { user } = req;
  const { tripId } = req.params;

  try {
    // 1. Validate trip ID
    if (!tripId) {
      return res.status(400).json({ message: "Invalid trip ID" });
    }

    // 2. Fetch trip
    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    // 3. Check permission
    const canView = await trip.canView(user);
    if (!canView) {
      return res.status(403).json({ message: "You are not allowed to view this trip" });
    }
    const tripData={}

    // 4. Populate necessary data
    const populatedTrip = await trip.populate([
      { 
        path: "user",
        select: "name username avatar" 
      },
      {
        path: "acceptedFriends.user",
        select: "name username avatar",
      },
      {
        path: "posts.post",
        populate: [
          { path: "author", select: "name username avatar" },
          { path: "comments", select: "_id" },
          {path :"likes" , select:"_id"}
        ],
      },
    ]);

    // 5. Prepare computed flags and data
    const isOwner = trip.isOwnedBy(user._id);
    const isInvited = trip.isFriendInvited(user._id);
    const isCollaborator = trip.isFriendAccepted(user._id);
    const isLiked = trip.likes.some((id) => id.toString() === user._id.toString());

    // 6. Format sections (optional: sort/pick only required fields)
    const notes = [...trip.notes].sort((a, b) => {
      if (a.isPinned === b.isPinned) {
        return new Date(b.createdAt) - new Date(a.createdAt);
      }
      return a.isPinned ? -1 : 1;
    });

    const todos = [...trip.todoList].sort((a, b) => {
      const aDate = a.dueDate || a.createdAt;
      const bDate = b.dueDate || b.createdAt;
      return new Date(aDate) - new Date(bDate);
    });

    const expenses = [...trip.expenses].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    // 7. Send response
    res.status(200).json({
      trip: {
        ...trip.toObject(),
        virtuals: {
          tripStatus: trip.tripStatus,
          duration: trip.duration,
          durationText: trip.durationText,
          postCount: trip.postCount,
          destinationCount: trip.destinationCount,
          isCollaborative: trip.isCollaborative,
        },
        currentUser: {
          isOwner,
          isInvited,
          isCollaborator,
          isLiked,
        },
        notes,
        todos,
        expenses,
        totalLikes: trip.likes.length,
        totalComments: trip.totalComments,
      },
    });
  } catch (error) {
    console.error("Error fetching trip by ID:", error);
    res.status(500).json({ message: "Server error" });
  }
};

export default getTripById;
