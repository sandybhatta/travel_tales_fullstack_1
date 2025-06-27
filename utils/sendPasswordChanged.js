import nodemailer from "nodemailer";
import ejs from "ejs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv"
dotenv.config()

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const transporter = nodemailer.createTransport({
  host:process.env.SMTP_HOST,
  port:587,
  secure:false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

export const sendPasswordChangedEmail = async (name,email) => {
  const templatePath = path.join(__dirname, "../emails/passwordChanged.ejs");

  const html = await ejs.renderFile(templatePath, {
    name,
    time: new Date().toLocaleString(),
    
  });

  const mailOptions = {
    from: `"TravelTales Support" <${process.env.SMTP_USER}>`,
    to: email,
    bcc:process.env.SMTP_USER,
    subject: "Your TravelTales Password Was Changed",
    html,
  };

  return transporter.sendMail(mailOptions);
};
