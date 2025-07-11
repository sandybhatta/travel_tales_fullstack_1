import Trip from "../../models/trip.js";

const getAllInvitedTrips = async (req, res) => {
  const { user } = req;

  try {
    const invitedTrips = await Trip.find({
      invitedFriends: user._id,
      startDate: { $gte: new Date() }, // Upcoming trips
      isArchived: false,
      isCompleted: false,
    })
      .sort({ startDate: 1 })
      .populate("user", "name username avatar");

    if (!invitedTrips || invitedTrips.length === 0) {
      return res
        .status(200)
        .json({ message: "No upcoming trips where you're invited." });
    }

    const response = invitedTrips.map((trip) => ({
      id: trip._id,
      owner: trip.user,
      title: trip.title,
      photoUrl: trip.coverPhoto?.url || "",
      startDate: trip.startDate,
      endDate: trip.endDate,
      destinations: trip.destinations,
      duration: trip.duration,
      tags: trip.tags,
    }));

    return res.status(200).json({ trips: response });
  } catch (error) {
    console.error("Error fetching invited trips:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};

export default getAllInvitedTrips;
