import Trip from "../../models/trip.js";

const softDeleteAll = async (req, res) => {
  const { user } = req;

  try {
    const activeTrips = await Trip.find({
      user: user._id,
      isArchived: false,
    });

    const count = activeTrips.length;

    if (count === 0) {
      return res.status(200).json({
        message: "All your trips are already archived.",
        archivedCount: 0,
      });
    }

    await Trip.updateMany(
      { user: user._id, isArchived: false },
      { $set: { isArchived: true } }
    );

    return res.status(200).json({
      message: `${count} trip(s) archived successfully.`,
      archivedCount: count,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export default softDeleteAll;
