import User from "../../models/User.js";

const followerOfId = async (req, res) => {
  const { id } = req.params;
  const { user } = req;
  const limit = parseInt(req.query.limit) || 10;
  const skip = parseInt(req.query.skip) || 0;

  try {
    const target = await User.findById(id).select("followers isBanned isDeactivated blockedUsers privacy closeFriends");

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

    const hasBlocked = user.blockedUsers?.some(
        (userId) => userId.toString() === target._id.toString()
      );
  
      if (hasBlocked) {
        return res.status(403).json({ message: "You blocked the user" });
      }

    const visibility = target.privacy?.profileVisibility || "public";

    if (visibility === "private") {
        if(id.toString() !== user._id.toString()){
            return res.status(403).json({ message: "This account is private" });
        }
     
    }

    if (visibility === "followers") {
      const isFollower = target.followers.some(
        (followerId) => followerId.toString() === user._id.toString()
      );
      if (!isFollower) {
        return res.status(403).json({
          message: "Only followers can view this user's followers",
        });
      }
    }

    if(visibility==="close_friends"){

        const isCloseFriends= target.closeFriends?.some(uid=>uid.toString() === user._id.toString())

        if(!isCloseFriends){
            return res.status(403).json({
                message: "Only close friends can view this user's followers",
              });
        }

    }

    // Paginate the followers manually
    const totalFollowers = target.followers.length;
    //if no followers
    if (totalFollowers === 0) {
        return res.status(200).json({
          count: 0,
          followerList: [],
          hasMore: false,
        });
      }
    const followerIds = target.followers.slice(skip, skip + limit);

    const followers = await User.find({ _id: { $in: followerIds } })
      .select("username name avatar")
      .lean();

    return res.status(200).json({
        count:totalFollowers,
      followerList: followers,
      hasMore: skip + limit < totalFollowers,
    });

  } catch (error) {
    console.error("Error fetching followers:", error);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default followerOfId;
