import ejs from "ejs";
import path from "path";
import nodemailer from "nodemailer";
import dotenv from "dotenv";
import { fileURLToPath } from 'url';
import { dirname } from 'path';

dotenv.config();

// 👇 Fix __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// transport smtp settings
const transport = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});

// function to send verification  email using nodemailer
export async function sendEmail(email, username, token, message) {
  console.log(path.join(__dirname));
  const templatePath = path.join(__dirname, "../emails/verifyEmail.ejs");

  const verifyLink = `${process.env.CLIENT_URL}/verify-email?token=${token}`;
  
  
  const html = await ejs.renderFile(templatePath, { username, verifyLink,message });

  await transport.sendMail({
    from: `TravelTales <${process.env.SMTP_USER}>`,
    to: email,
    bcc: `${process.env.SMTP_USER}`,
    subject: `Verify your email, ${username}`,
    html,
  });
}
