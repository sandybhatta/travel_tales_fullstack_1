import Trip from "../../models/trip";

const visibilityChange = async (req, res) => {
  const { tripId } = req.params;
  const { user } = req;
  const { visibility } = req.body;

  try {
    if (!tripId) {
      return res.status(400).json({ message: "No trip ID found" });
    }

    if (!visibility) {
      return res.status(400).json({ message: "Select the type of visibility you want" });
    }

    const allowedVisibility = ["public", "followers", "close_friends", "private"];
    if (!allowedVisibility.includes(visibility)) {
      return res.status(400).json({ message: "Invalid visibility type" });
    }

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ message: "Trip not found" });
    }

    const isOwner = trip.isOwnedBy(user._id);
    if (!isOwner) {
      return res.status(403).json({ message: "Only the owner can change trip visibility" });
    }

    if (trip.visibility === visibility) {
      return res.status(200).json({ message: "This visibility is already set" });
    }

    trip.visibility = visibility;
    await trip.save();

    return res.status(200).json({
      message: "Trip visibility has been updated",
      visibility: trip.visibility,
    });
  } catch (error) {
    console.error("Visibility change error:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default visibilityChange;
