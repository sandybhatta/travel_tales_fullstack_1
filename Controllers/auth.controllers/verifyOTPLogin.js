import User from "../models/User.js";
import OTP from "../models/Otp.js";
import { getAccessToken, getRefreshToken } from "../utils/tokenCreate.js";
import {validationResult} from "express-validator"

export const verifyOtpLogin = async (req, res) => {


  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });


  const { userId, otp } = req.body;

  // 🔐 1. Validate input
  if (!userId || !otp) {
    return res.status(400).json({ message: "userId and OTP are required." });
  }

  try {
    // 🔍 2. Find the OTP record
    const otpDoc = await OTP.findOne({ user: userId,type: "login" });
    if (!otpDoc) {
      return res.status(400).json({ message: "OTP not found or already used." });
    }

    // ❌ 3. Check expiration
    if (otpDoc.expiresAt < Date.now()) {
      await otpDoc.deleteOne();
      return res.status(400).json({ message: "OTP expired. Please login again." });
    }

    // 🔄 4. Match OTP
    const isValid = await otpDoc.isValidOtp(otp);
    if (!isValid) {
      return res.status(400).json({ message: "Invalid OTP." });
    }

    // ✅ 5. All good – generate tokens
    const refreshToken = await getRefreshToken(userId); // You store it in DB inside that function
    const accessToken = getAccessToken(userId);

    // 🧼 6. Clean up used OTP
    await otpDoc.deleteOne();

    // 📝 7. Update user's lastLogin (optional)
    await User.findByIdAndUpdate(userId, { lastLogin: new Date() });

    // 🍪 8. Send refresh token in secure httpOnly cookie
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // 📦 9. Send access token + user info
    const user = await User.findById(userId)

    res.status(200).json({
      message: "OTP verified. Login complete.",
      accessToken,
      user,
    });
  } catch (err) {
    console.error("OTP Verify Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
