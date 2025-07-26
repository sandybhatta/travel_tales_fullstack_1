import User from "../../models/User.js";
import crypto from "crypto";

const verifyEmailChange = async (req, res) => {
  const { token } = req.query;

  if (!token) {
    return res.status(400).json({ message: "Token not provided" });
  }

  try {
    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      emailVerifyToken: hashedToken,
      emailVerifyTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(403).json({ message: "Invalid or expired token" });
    }

    if (!user.pendingEmail) {
      return res.status(400).json({ message: "No pending email associated with this token" });
    }

    user.email = user.pendingEmail;
    user.pendingEmail = undefined;
    user.emailVerifyToken = undefined;
    user.emailVerifyTokenExpires = undefined;

    await user.save();

    return res.status(200).json({ message: "Email changed successfully" });
  } catch (error) {
    console.error(" Error verifying email change:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default verifyEmailChange;
