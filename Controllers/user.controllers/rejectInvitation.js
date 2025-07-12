import Trip from "../../models/trip.js"; 
const rejectInvitation = async (req, res) => {
  const { tripId } = req.params;
  const { user } = req;

  try {
    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ success: false, message: "No trip found" });
    }

    // Check if user is in invited list
    if (!trip.isFriendInvited(user._id)) {
      return res.status(400).json({
        success: false,
        message: "You are not in the invited list of this trip",
      });
    }

    // Remove user from invitedFriends list
    trip.invitedFriends = trip.invitedFriends.filter(
      (id) => id.toString() !== user._id.toString()
    );

    await trip.save(); // ✅ Save the updated trip

    return res.status(200).json({ success: true, message: "Invitation rejected" });
  } catch (error) {
    console.error("Reject Invitation Error:", error);
    return res.status(500).json({ success: false, message: "Internal Server Error" });
  }
};

export default rejectInvitation;
