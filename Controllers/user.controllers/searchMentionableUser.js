import User from "../../models/User.js";

const searchMentionableUser = async (req, res) => {
  try {
    const { user } = req; // from protect middleware
    const { q } = req.query;

    if (!q || q.trim().length < 1) {
      return res.status(400).json({ message: "Query is required" });
    }

    const regex = new RegExp("^" + q, "i"); // case-insensitive match from beginning

    // First search from users they follow
    const currentUser = await User.findById(user._id).select("following");

    const followingMatches = await User.find({
      _id: { $in: currentUser.following },
      username: { $regex: regex },
    })
      .select("username name avatar")
      .limit(15);

    // If following matches are enough, return them
    if (followingMatches.length >= 5) {
      return res.json({ users: followingMatches });
    }

    // Fetch more globally (excluding already matched users + current user)
    const followingIds = followingMatches.map((u) => u._id);
    followingIds.push(user._id); // exclude self

    const globalMatches = await User.find({
      _id: { $nin: followingIds },
      username: { $regex: regex },
    })
      .select("username name avatar")
      .limit(15 - followingMatches.length);

    const allMatches = [...followingMatches, ...globalMatches];

    return res.json({ users: allMatches });
  } catch (error) {
    console.error("Mention search error:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default searchMentionableUser;
