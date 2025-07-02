import User from "../../models/User.js";

const followerOfId = async (req, res) => {
  const { id } = req.params;
  const { user } = req;

  try {
    const target = await User.findById(id).populate({
      path: "followers",
      select: "username name avatar",
    });

    if (!target) {
      return res.status(404).json({ message: "User not found" });
    }

    if (target.isBanned) {
      return res.status(403).json({ message: "User is banned from TravelTales" });
    }

    if (target.isDeactivated) {
      return res.status(403).json({ message: "User is currently deactivated" });
    }

    const isBlocked = target.blockedUsers?.some(
      (userId) => userId.toString() === user._id.toString()
    );

    if (isBlocked) {
      return res.status(403).json({ message: "You are blocked by this user" });
    }

    const visibility = target.privacy?.profileVisibility || "public";

    if (visibility === "private") {
      return res.status(403).json({ message: "This account is private" });
    }

    if (visibility === "followers") {
      const isFollower = target.followers.some(
        (followerId) => followerId._id.toString() === user._id.toString()
      );
      if (!isFollower) {
        return res.status(403).json({
          message: "Only followers can view this user's followers",
        });
      }
    }

    return res.status(200).json({ followerList: target.followers });
  } catch (error) {
    console.error("Error fetching followers:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default followerOfId;
