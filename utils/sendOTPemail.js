import nodemailer from "nodemailer";
import ejs from "ejs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
dotenv.config()

// __dirname fix for ES Module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// SMTP transporter config
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const sendOTPEmail = async (email, username, otp,type='login') => {
  try {
    const templatePath = path.join(__dirname, "../emails/otp.ejs");

    const html = await ejs.renderFile(templatePath, {
      username,
      otp,
      expiresIn: 10,
    });



    const subject= type ==='login'? "Your TravelTales OTP for Login" :"🔐 Your TravelTales OTP for forget password"
    const mailOptions = {
      from: `"TravelTales Support" <${process.env.SMTP_USER}>`,
      to: email,
      bcc: process.env.SMTP_USER, // For log copy
      subject,
      html,
    };

    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error("Email Sending Failed:", error.response || error);
    throw new Error("OTP email could not be sent");
  }
};
