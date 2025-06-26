import nodemailer from "nodemailer";
import ejs from "ejs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
dotenv.config()

// For __dirname support in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 587,
  secure:false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const sendWelcomeEmail = async (user) => {
  const templatePath = path.join(__dirname, "../emails/welcomeEmail.ejs");

  const html = await ejs.renderFile(templatePath, {
    username: user.username,
  });

  const mailOptions = {
    from: `"TravelTales" <${process.env.EMAIL_USER}>`,
    to: user.email,
    bcc:process.env.SMTP_USER,
    subject: "🎉 Welcome to TravelTales!",
    html,
  };

  await transporter.sendMail(mailOptions);
};
