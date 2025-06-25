import mongoose from "mongoose";
import crypto from "crypto";

const otpTokenSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    otp: {
      type: String, // Store hashed OTP (never raw OTP)
      required: true,
    },

    type: {
      type: String,
      enum: ["login", "reset_password"],
      required: true,
    },

    expiresAt: {
      type: Date,
      required: true,
      index: { expires: 0 }, // Auto-delete expired docs using TTL
    },

    used: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// 🔐 Instance method to validate OTP
otpTokenSchema.methods.isValidOtp = function (enteredOtp) {
  const enteredHash = crypto
    .createHash("sha256")
    .update(enteredOtp)
    .digest("hex");

  return this.otp === enteredHash && !this.used && this.expiresAt > new Date();
};

// 🛠 Static to generate OTP
otpTokenSchema.statics.generateOtpForUser = async function (userId, type) {
  const rawOtp = Math.floor(100000 + Math.random() * 900000).toString(); // 6-digit

  const hashedOtp = crypto
    .createHash("sha256")
    .update(rawOtp)
    .digest("hex");

  const expiresIn = 10 * 60 * 1000; // 10 minutes

  await this.deleteMany({ user: userId, type }); // Remove old OTPs of same type

  await this.create({
    user: userId,
    otp: hashedOtp,
    type,
    expiresAt: new Date(Date.now() + expiresIn),
  });

  return rawOtp;
};

const OtpToken = mongoose.model("OtpToken", otpTokenSchema);
export default OtpToken;
