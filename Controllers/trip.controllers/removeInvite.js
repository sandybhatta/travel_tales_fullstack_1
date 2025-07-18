import Trip from "../../models/trip.js";


const removeInvite = async (req, res) => {
  const { tripId, userId } = req.params;
  const { user } = req;

  if (!tripId || !userId) {
    return res.status(400).json({ message: "Trip ID and User ID are both required." });
  }

  try {
    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ message: "No trip was found." });
    }

    if (!trip.isOwnedBy(user._id)) {
      return res.status(403).json({ message: "You are not the owner of the trip." });
    }

    const isInvited = trip.isFriendInvited(userId);
    if (!isInvited) {
      return res.status(400).json({ message: "The user is not in the invited list." });
    }

    // Remove user from invitedFriends
    trip.invitedFriends = trip.invitedFriends.filter(
      (fid) => fid.toString() !== userId.toString()
    );

    await trip.save();

    return res.status(200).json({
      success: true,
      message: "The user was successfully removed from the invited list.",
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export default removeInvite;
