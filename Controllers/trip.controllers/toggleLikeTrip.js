import Trip from "../../models/trip.js";

const toggleLike = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { user } = req;

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ success: false, message: "Trip not found" });
    }

    const isLiked = trip.likes?.some(id => id.toString() === user._id.toString());

    if (isLiked) {
      trip.likes = trip.likes.filter(id => id.toString() !== user._id.toString());
    } else {
      trip.likes.push(user._id);
    }

    await trip.save();

    res.status(200).json({
      success: true,
      liked: !isLiked,
      likesCount: trip.likes.length,
    });
  } catch (error) {
    console.error("Error toggling trip like:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
};

export default toggleLike;
