import Trip from "../../models/trip";
import User from "../../models/User";

const removeCollaborator = async (req, res) => {
  const { tripId, userId } = req.params;
  const { user } = req;

  try {
    const collaborator = await User.findById(userId);
    if (!collaborator) {
      return res.status(404).json({ message: "Collaborator not found" });
    }

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    const isOwner = trip.isOwnedBy(user._id);
    if (!isOwner) {
      return res.status(403).json({ message: "Only the owner can remove collaborators" });
    }

    const isAccepted = trip.isFriendAccepted(userId)
    if (!isAccepted) {
      return res.status(400).json({ message: "User is not a collaborator" });
    }

    trip.acceptedFriends = trip.acceptedFriends.filter(
      friend => friend.user.toString() !== userId.toString()
    );
    await trip.save();

    return res.status(200).json({ message: "Collaborator removed successfully" });
  } catch (error) {
    console.error("Error removing collaborator:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default removeCollaborator;
