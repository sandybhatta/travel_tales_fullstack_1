import User from "../../models/User.js";
import OTP from "../../models/Otp.js";
import { sendOTPEmail } from "../../utils/sendOTPEmail.js";

export const resendOtp = async (req, res) => {
  const { userId, type } = req.body;

  if (!userId || !type) {
    return res.status(400).json({ message: "userId and OTP type are required." });
  }

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found." });

    // 🧼 Delete old OTPs of same type
    await OTP.deleteMany({ user: user._id, type });

    // 🔄 Generate new OTP
    const newOtp = await OTP.generateOtpForUser(user._id, type);

    // ✉️ Resend email
    await sendOTPEmail(user.email, user.username, newOtp);

    res.status(200).json({ message: "A new OTP has been sent to your email." });
  } catch (err) {
    console.error("Resend OTP Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
