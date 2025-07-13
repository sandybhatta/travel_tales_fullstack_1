import Trip from "../../models/trip.js";

const getPublicTrips = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const { search, tag, sortBy } = req.query;

    // Base public filter
    const query = { visibility: "public" };

    // Tag filter
    if (tag) {
      query.tags = tag;
    }

    // Search filter (title or destination)
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { destinations: { $regex: search, $options: "i" } }
      ];
    }

    // Sorting
    let sortOption = { createdAt: -1 }; // default: newest
    if (sortBy === "popular") {
      sortOption = { "likes.length": -1 }; // Assuming you're storing likes as array
    } else if (sortBy === "oldest") {
      sortOption = { createdAt: 1 };
    }

    // Query
    const trips = await Trip.find(query)
      .sort(sortOption)
      .skip(skip)
      .limit(limit)
      .populate("user", "name username avatar")
      .select("-__v");

    const totalCount = await Trip.countDocuments(query);

    res.status(200).json({
      trips,
      page,
      totalPages: Math.ceil(totalCount / limit),
      totalCount
    });
  } catch (error) {
    console.error("Error fetching public trips:", error);
    res.status(500).json({ message: "Something went wrong" });
  }
};

export default getPublicTrips;
