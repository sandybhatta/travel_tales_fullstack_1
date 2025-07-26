import Trip from "../../models/trip.js";
import User from "../../models/User.js";

const viewableTrip = async (req, res) => {
  try {
    const user = req.user;

    //  1. Pagination and filters
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    const { tag, search, sortBy } = req.query;

    //  2. Find users who added me to closeFriendsList

    //users where i am in their close friend
    const closeFriendsDocs = await User.find({ closeFriends: user._id }).select("_id");

    const closeFriendsOfUser = closeFriendsDocs.map(doc => doc._id);

    //  3. Find users who have me in their followers list
    const followerDocs = await User.find({ followers: user._id }).select("_id");

    const followedUsers = followerDocs.map(doc => doc._id);

    //  4. Build base visibility query
    const baseQuery = {
      $or: [
        { user: user._id },
        { acceptedFriends: user._id },
        { invitedFriends: user._id },
        { visibility: "public" },
        {
          visibility: "close_friends",
          user: { $in: closeFriendsOfUser },
        },
        {
          visibility: "followers",
          user: { $in: followedUsers },
        },
      ]
    };

    //  5. Tag filter
    if (tag) {
      baseQuery.tags = tag;
    }

    //  6. Search filter (title or destination)
    if (search) {
      baseQuery.$and = baseQuery.$and || [];
      baseQuery.$and.push({
        $or: [
          { title: { $regex: search, $options: "i" } },
          { destinations: { $regex: search, $options: "i" } }
        ]
      });
    }

    //  7. Sorting options
    let sortOption = { createdAt: -1 }; // default: newest
    if (sortBy === "oldest") {
      sortOption = { createdAt: 1 };
    } else if (sortBy === "popular") {
      sortOption = { "likes.length": -1 };
    }

    //  8. Fetch trips
    const trips = await Trip.find(baseQuery)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .populate("user", "name username avatar")
      .select("-__v");

    //  9. Count total for pagination
    const totalCount = await Trip.countDocuments(baseQuery);

    //  10. Return response
    res.status(200).json({
      trips,
      page,
      totalPages: Math.ceil(totalCount / limit),
      totalCount
    });

  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export default viewableTrip;
