import User from "../../models/User.js";
import { sendEmail } from "../../utils/transportEmail.js";

const changeEmail = async (req, res) => {
  const { email } = req.body;
  const { user } = req;

  try {
    if (!email) {
      return res.status(400).json({ message: "Provide email" });
    }

    if (!user.isVerified) {
      return res.status(400).json({ message: "Verify your account first via email" });
    }
    if (user.isBanned) {
      return res.status(400).json({ message: "You are banned from TravelTales" });
    }
    if (user.isDeactivated) {
      return res.status(400).json({ message: "Reactivate your account before changing email" });
    }

    const isEmailPresentAlready = await User.findOne({ email });
    if (isEmailPresentAlready) {
      return res.status(400).json({ message: "Email is already taken by a user" });
    }

    if (user.emailVerifyTokenExpires && user.emailVerifyTokenExpires > Date.now()) {
      return res.status(400).json({
        message: "Email verification link already sent. Wait 30 minutes before retrying.",
      });
    }

    const rawToken = user.createEmailVerificationToken();
    user.pendingEmail = email; // store new email temporarily
    await user.save(); // important

    await sendEmail(
      email, // send to new email
      user.username,
      rawToken,
      "Please confirm your new email address for TravelTales by clicking the button below within 30 minutes."
    );

    return res.status(200).json({
      message: "Verification link sent to your new email. Please confirm within 30 minutes.",
    });
  } catch (error) {
    console.error("❌ Error in changeEmail:", error.message);
    return res.status(500).json({ message: "Internal server error" });
  }
};

export default changeEmail;
