import crypto from "crypto";
import User from "../models/User.js";
import { sendWelcomeEmail } from "../utils/sendWelcomeEmail.js";

export const verifyEmail = async (req, res) => {
  try {
    const token = req.query.token;
    if (!token) {
      return res.status(400).json({ message: "No token provided" });
    }

    const hashedToken = crypto.createHash("sha256").update(token).digest("hex");

    const user = await User.findOne({
      emailVerifyToken: hashedToken,
      emailVerifyTokenExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ message: "Invalid or expired token" });
    }

    if (user.isVerified) {
      return res.status(200).json({ message: "Email is already verified" });
    }

    user.isVerified = true;
    user.emailVerifyToken = undefined;
    user.emailVerifyTokenExpires = undefined;

    await user.save();

    // Optional: send welcome email here
    await sendWelcomeEmail(user);

    return res.status(200).json({ message: "Email successfully verified!" });
  } catch (error) {
    console.error("Email verification error:", error);
    return res.status(500).json({ message: "Server error" });
  }
};
