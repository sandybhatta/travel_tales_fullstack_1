import Trip from "../../models/trip.js";
import User from "../../models/User.js";

const tripsOfUser = async (req, res) => {
  const { userId } = req.params;
  const { user } = req;

  if (!userId) {
    return res.status(400).json({ message: "User ID was not provided." });
  }

  try {
    const tripOwner = await User.findById(userId).select("closeFriends followers");

    if (!tripOwner) {
      return res.status(404).json({ message: "User not found." });
    }

    const allTrips = await Trip.find({$or:[
        { acceptedFriends: userId }
    ]});

    if (allTrips.length === 0) {
      return res.status(200).json({ message: "No trips found for this user." });
    }

    // Self case — show all
    if (userId.toString() === user._id.toString()) {
      return res.status(200).json({ trips: allTrips, count: allTrips.length });
    }

    // Categorize trips by visibility
    const publicTrips = allTrips.filter((trip) => trip.visibility === "public");
    const followersTrips = allTrips.filter((trip) => trip.visibility === "followers");
    const closeFriendsTrips = allTrips.filter((trip) => trip.visibility === "close_friends");

    const isCloseFriend = tripOwner.closeFriends?.some((id) => id.toString() === user._id.toString());
    const isFollower = tripOwner.followers?.some((id) => id.toString() === user._id.toString());

    let visibleTrips = [...publicTrips];

    if (isCloseFriend) {
      visibleTrips.push(...followersTrips, ...closeFriendsTrips);
    } else if (isFollower) {
      visibleTrips.push(...followersTrips);
    }

    return res.status(200).json({ trips: visibleTrips, count: visibleTrips.length });

  } catch (error) {
    
    return res.status(500).json({ message: "Internal server error." });
  }
};

export default tripsOfUser;
