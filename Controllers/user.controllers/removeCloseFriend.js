import User from "../../models/User.js";

const removeCloseFriend = async (req, res) => {
  try {
    const { id } = req.params;
    const { user } = req;

    // Check if the ID is in the closeFriends list
    const isACloseFriend = user.closeFriends?.some(
      (closeId) => closeId.toString() === id.toString()
    );

    if (!isACloseFriend) {
      return res
        .status(400)
        .json({ message: "This user is not in your close friends list." });
    }

    // Remove the friend from closeFriends
    await User.findByIdAndUpdate(user._id, {
      $pull: { closeFriends: id },
    });

    return res
      .status(200)
      .json({ message: "Close friend removed successfully." });
      
  } catch (err) {
    console.error("Remove close friend error:", err);
    return res.status(500).json({ message: "Something went wrong." });
  }
};

export default removeCloseFriend;
