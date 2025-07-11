import Trip from "../../models/trip.js";

const acceptToTrip = async (req, res) => {
  const { tripId } = req.params;
  const { user } = req;

  try {
    if (!tripId) {
      return res.status(400).json({ message: "Trip ID is required." });
    }

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ message: "Trip not found." });
    }

    if (new Date() > trip.endDate) {
        return res.status(400).json({ message: "The trip has already ended." });
      }
    if(trip.isArchived || trip.isCompleted ){
        return res.status(400).json({message:"you cannot accept this inviation now"})
    }
    const isAlreadyAccepted = trip.isFriendAccepted(user._id);
    if (isAlreadyAccepted) {
      return res
        .status(200)
        .json({ message: "You have already accepted the invitation to this trip." });
    }

    const isInvited = trip.isFriendInvited(user._id);
    if (!isInvited) {
      return res
        .status(403)
        .json({ message: "You are not invited to this trip." });
    }

    // 
    await trip.acceptInvitation(user._id);

    return res
      .status(200)
      .json({ message: "Trip invitation accepted successfully." });

  } catch (error) {
    console.error("Trip invitation error:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export default acceptToTrip;
