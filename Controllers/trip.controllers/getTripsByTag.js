import Trip from "../../models/trip.js";
import User from "../../models/User.js";

const getTripsByTagname = async (req, res) => {
  const { user } = req;
  const { tagname } = req.params;

  try {
    const allTaggedTrips = await Trip.find({ tags: tagname })
      .sort({ createdAt: -1 })
      .populate("user", "name username avatar")
      .populate("acceptedFriends.user", "name username avatar");

    // Filter viewable trips based on visibility logic
    const viewableTrips = [];

    for (const trip of allTaggedTrips) {
      const creator = trip.user;

      const isOwner = trip.isOwnedBy(user._id)
      const isCollaborator = trip.acceptedFriends.some(f => f.user.toString() === user._id.toString());

      if (trip.visibility === "public") {
        viewableTrips.push(trip);
        continue;
      }

      if (trip.visibility === "private") {
        if (isOwner ) viewableTrips.push(trip);
        continue;
      }

      if (trip.visibility === "followers") {
        const creatorDoc = await User.findById(creator).select("followers");
        if (creatorDoc.followers.includes(user._id)) {
          viewableTrips.push(trip);
        }
        continue;
      }

      if (trip.visibility === "close_friends") {
        const creatorDoc = await User.findById(creator).select("closeFriends");
        if (creatorDoc.closeFriends.includes(user._id)) {
          viewableTrips.push(trip);
        }
        continue;
      }

     
    }

    res.status(200).json({
      total: viewableTrips.length,
      trips: viewableTrips,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export default getTripsByTagname;
