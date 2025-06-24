import { validationResult } from "express-validator";
import User from "../models/User.js";
import { sendEmail } from "../utils/transportEmail.js"; 



export const registerUser = async (req, res) => {
  // Step 1: Validate incoming request body
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, username, password, location } = req.body;

  try {
    // Step 2: Check if email already exists
    const existingEmail = await User.findOne({ email });

    if (existingEmail && existingEmail.isVerified) {
      return res.status(400).json({ message: "Email is already in use." });
    }

    if (existingEmail && !existingEmail.isVerified) {
      // Reuse unverified account: generate new token and resend
      const rawToken = existingEmail.createEmailVerificationToken();
      await existingEmail.save(); // Save updated token
      await sendEmail(email, username, rawToken);
      return res
        .status(400)
        .json({ message: "Please verify your email. A new link has been sent." });
    }

    // Step 3: Check if username is taken (only if verified)
    const existingUsername = await User.findOne({ username });
    if (existingUsername && existingUsername.isVerified) {
      return res.status(400).json({ message: "Username is already taken." });
    }

    // Step 4: Create new user instance
    const newUser = new User({
      email,
      username,
      password,
      location,
    });

    // Step 5: Generate and attach verification token
    const rawToken = newUser.createEmailVerificationToken();

    // Step 6: Save user to DB (so hashed token is stored)
    await newUser.save();

    // Step 7: Send verification email
    await sendEmail(email, username, rawToken);

    // Step 8: Respond success
    res.status(201).json({
      message: "Registration successful! Check your email to verify your account.",
    });
  } catch (err) {
    console.error("Registration Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};
