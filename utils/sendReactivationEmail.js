import ejs from "ejs";
import path from "path";
// Adjust if your transporter is elsewhere
import { fileURLToPath } from "url";
import { dirname } from "path";
import nodemailer from "nodemailer"
// To get __dirname in ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);






const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASSWORD,
  },
});





export const sendReactivationEmail = async (email, username) => {





  try {
    // Template path
    const templatePath = path.join(__dirname, "../emails/accountReactivated.ejs");

    // Frontend login URL
    const loginUrl = `${process.env.CLIENT_URL}/login`;

    // Render EJS to HTML
    const html = await ejs.renderFile(templatePath, {
      username,
      loginUrl,
    });

    // Define mail options
    const mailOptions = {
      from: `"TravelTales Support" <${process.env.SMTP_USER}>`,
      to: email,
      bcc:process.env.SMTP_USER,
      subject: "Your Account Has Been Reactivated - TravelTales",
      html,
    };

    // Send the mail
    await transporter.sendMail(mailOptions);
    console.log(`✅ Reactivation email sent to ${email}`);
  } catch (err) {
    console.error("❌ Failed to send reactivation email:", err.message);
    throw new Error("Reactivation email failed to send.");
  }
};
