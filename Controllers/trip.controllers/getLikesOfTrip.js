import Trip from "../../models/trip.js";
import User from "../../models/User.js";

const getLikesOfTrip = async (req, res) => {
  try {
    const { tripId } = req.params;
    const { user } = req;

    const trip = await Trip.findById(tripId)
      .select("likes")
      .populate("likes", "name username avatar");

    if (!trip) {
      return res.status(404).json({ message: "No trip found" });
    }

    const formattedLikes = trip.likes.map(likeDoc => {
      const like = likeDoc.toObject(); 
      return {
        ...like,
        isFollowing: user.following.includes(like._id.toString())
      };
    });

    return res.status(200).json({
      success: true,
      totalLikes: formattedLikes.length,
      likes: formattedLikes,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export default getLikesOfTrip;
