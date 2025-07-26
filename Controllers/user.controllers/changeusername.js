import User from "../../models/User.js";

const changeUsername = async (req, res) => {
  const { user } = req;
  let { username } = req.body;

  try {
    if (!user){ 
        return res.status(404).json({ message: "User not found" });
    }
    if (!username) {
        return res.status(400).json({ message: "Username is required" });
    }
    if (!user.isVerified) {
        return res.status(400).json({ message: "Verify your account first via email" });
    }
    if (user.isBanned) {
        return res.status(400).json({ message: "You are banned from TravelTales" });
    }
    if (user.isDeactivated){
        return res.status(400).json({ message: "Reactivate your account before changing username" });
    }

   

    if (user.usernameChangedAt && Date.now() - user.usernameChangedAt < 30 * 24 * 60 * 60 * 1000) {
      return res.status(400).json({ message: "Username can’t be changed within 30 days of the last change" });
    }

    const existing = await User.findOne({ username: username });
    if (existing) {
      return res.status(400).json({ message: "This username is already taken" });
    }

    

    user.username = username;
    user.usernameChangedAt = new Date();

    await user.save();

    return res.status(200).json({
      message: "Username changed successfully",
      newUsername: user.username
    });

  } catch (err) {
    console.error(" Error changing username:", err.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default changeUsername;
