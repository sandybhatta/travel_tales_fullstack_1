import User from "../../models/User.js";

const followUser = async (req, res) => {
  const { id } = req.params;
  const { user } = req;

  try {
    // 1. Prevent following yourself
    if (user._id.toString() === id.toString()) {
      return res.status(400).json({ message: "You cannot follow yourself" });
    }

    // 2. Check if target user exists
    const targetUser = await User.findById(id);
    if (!targetUser) {
      return res.status(404).json({ message: "User not found" });
    }

    // 3. Check if either user is banned or deactivated
    if (user.isBanned || targetUser.isBanned) {
      return res.status(403).json({ message: "Cannot follow a banned user" });
    }
    if (user.isDeactivated || targetUser.isDeactivated) {
      return res.status(403).json({ message: "Cannot follow a deactivated account" });
    }

    // 4. Check if you're blocked by that user
    const isBlocked = targetUser.blockedUsers?.some(
      (blockedId) => blockedId.toString() === user._id.toString()
    );
    if (isBlocked) {
      return res.status(403).json({ message: "You are blocked by this user" });
    }

    //5. check if you blocked the user you want to follow
    const hasBlocked= user.blockedUsers?.some(id=>id.toString()===targetUser._id)

    if (hasBlocked) {
        return res.status(403).json({ message: "You are blocked by this user" });
      }

    // 6. Check if already following
    const isAlreadyFollowing = targetUser.followers.some(
      (followerId) => followerId.toString() === user._id.toString()
    );
    if (isAlreadyFollowing) {
      return res.status(400).json({ message: "Already following this user" });
    }

    // 7. Perform follow
    user.following.push(targetUser._id);
    targetUser.followers.push(user._id);

    await user.save();
    await targetUser.save();

    // Optional: Trigger notification
    // yet to build after learning socket.io

    return res.status(200).json({ message: `Now following ${targetUser.username}` });
  } catch (error) {
    console.error("Follow Error:", error);
    return res.status(500).json({ message: "Something went wrong while following user." });
  }
};

export default followUser;
