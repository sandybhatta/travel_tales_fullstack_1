import Trip from "../../models/trip.js";

const getArchivedTrips = async (req, res) => {
  try {
    const { user } = req;

    const archivedTrips = await Trip.find({
      user: user._id,
      isArchived: true,
    })
      .sort({ createdAt: -1 })
      .populate("acceptedFriends.user", "name username avatar"); // fixed nested field

    return res.status(200).json({
      success: true,
      count: archivedTrips.length,
      archivedTrips,
    });

  } catch (error) {
    console.error("Error in getArchivedTrips:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
    });
  }
};

export default getArchivedTrips;
