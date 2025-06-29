import nodemailer from "nodemailer";
import path from "path";
import ejs from "ejs";
import { fileURLToPath } from "url";
import dotenv from "dotenv"
dotenv.config()

// Get __dirname (for ES modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configure transporter (Use your SMTP provider settings)
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,// Or use SendGrid, Mailgun, etc.
  port:587,
  secure:false,
  auth: {
    user: process.env.SMTP_USER, // e.g. your Gmail or domain email
    pass: process.env.SMTP_PASSWORD, // App password or SMTP password
  },
});

// Main function to send email
export const sendDeactivateEmail = async ( email, username ) => {
  try {
    // Path to EJS template
    const templatePath = path.join(__dirname, `../emails/accountDeactivated.ejs`);


    const loginUrl=`${process.env.CLIENT_URL}/login`
    // Render HTML with data
    const html = await ejs.renderFile(templatePath, {
        username,
        loginUrl
    });

    // Email options
    const mailOptions = {
      from: `"TravelTales Support" <${process.env.SMTP_USER}>`,
      to:email,
      subject:"Your Account is Deactivated",
      html,
    };

    // Send email
    await transporter.sendMail(mailOptions);
    console.log(`✅ Email sent to ${email}`);
  } catch (err) {
    console.error("❌ Email sending error:", err.message);
    throw new Error("Failed to send email");
  }
};
