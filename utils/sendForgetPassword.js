import nodemailer from "nodemailer";
import ejs from "ejs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Email transporter
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// Send forget password email
export const forgetPasswordEmail = async (email, name, token) => {
  const templatePath = path.join(__dirname, "../emails/forgetPassword.ejs");

  const resetLink = `${process.env.CLIENT_URL}/reset-password?token=${token}`;

  const html = await ejs.renderFile(templatePath, { name, resetLink });

  const mailOptions = {
    from: `"TravelTales" <${process.env.SMTP_USER}>`,
    to: email,
    subject: "Reset Your TravelTales Password",
    html,
    bcc: process.env.SMTP_USER, 
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (err) {
    console.error("Failed to send forget password email:", err);
    throw new Error("Email delivery failed.");
  }
};
