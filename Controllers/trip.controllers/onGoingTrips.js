import Trip from "../../models/trip.js";

const onGoingTrips = async (req, res) => {
  try {
    const { user } = req;

    const today = new Date();
    today.setHours(0, 0, 0, 0); 

    // only trips that starts before today and end after today
    const trips = await Trip.find({
      user: user._id,
      startDate: { $lte: today },
      endDate:{$gte:today}
    }).sort({ startDate: -1 }); 

    return res.status(200).json({
      success: true,
      count: trips.length,
      onGoingTrips: trips
    });
  } catch (error) {
  
    return res.status(500).json({ message: "Server error", error: error.message });
  }
};

export default onGoingTrips;