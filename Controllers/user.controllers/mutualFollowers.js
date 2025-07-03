import User from "../../models/User.js";

const mutualFollowers = async (req, res) => {
  const { id } = req.params;
  const { user } = req;

  const skip = parseInt(req.query.skip) || 0;
  const limit = parseInt(req.query.limit) || 10;

  try {
    const target = await User.findById(id).select(
      "username name avatar followers following isBanned isDeactivated blockedUsers privacy"
    );

    if (!target) {
      return res.status(404).json({ message: "No user found" });
    }

    if (target.isBanned) {
      return res.status(403).json({ message: "User is banned from TravelTales" });
    }

    if (target.isDeactivated) {
      return res.status(403).json({ message: "User is deactivated" });
    }

    // Block & privacy checks
    const isUserBlocked = target.blockedUsers?.some(uid => uid.toString() === user._id.toString());
    const hasBlocked = user.blockedUsers?.some(uid => uid.toString() === target._id.toString());

    if (isUserBlocked || hasBlocked) {
      return res.status(403).json({ message: "You cannot access this user's followers" });
    }

    const profileVisibility = target.privacy?.profileVisibility || "public";
    if (profileVisibility === "private") {
      return res.status(403).json({ message: "The account is private" });
    }
    if (profileVisibility === "followers") {
      const isFollower = target.followers.some(fid => fid.toString() === user._id.toString());
      if (!isFollower) {
        return res.status(403).json({ message: "Follow the user to see mutual followers" });
      }
    }

    // Calculate mutual followers using Set
    // because in set the .has() method is O(1)

    const userFollowerSet = new Set(user.followers.map(f => f.toString()));

    const mutualIds = target.followers
      .map(f => f.toString())
      .filter(fid => userFollowerSet.has(fid));

    const mutualFollowers = await User.find({ _id: { $in: mutualIds } })
      .select("name username avatar")
      .skip(skip)
      .limit(limit);

    return res.status(200).json({ 
        count: mutualIds.length,
        mutualFollowers ,
        hasMore:skip+limit<mutualIds.length
        });
  } catch (error) {
    console.error("Mutual followers error:", error);
    return res.status(500).json({ message: "Something went wrong" });
  }
};

export default mutualFollowers;
