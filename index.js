// index.js
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { connectDb } from "./config/db.js";
import authRoutes from "./routes/authroutes.js"
import userRoutes from "./routes/userRoutes.js"
dotenv.config();


connectDb();

// 🚀 Create Express app
const app = express();

// 🧠 Middlewares
app.use(express.json()); // Parse JSON request body
app.use(cookieParser()); // Parse cookies
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true, // Required to send cookies from frontend
}));




// 🛣️ Routes (will be created soon)
app.get("/", (req, res) => {
  res.send("🌍 API is running...");
});

// creating transport 
// const transport=nodemailer.createTransport({
//   host: process.env.SMTP_HOST,
//   port:587,
//   secure:false,
//   auth:{
//     user:process.env.SMTP_USER,
//     pass:process.env.SMTP_PASSWORD
//   }

// })
// const mailOptions={
//   from:"TravelTales <sandipresponse256@gmail.com>",
//   to:"sandipresponse09@gmail.com",
//   subject:"teri ma ka bhosda subject",
//   text:"This is a test email from TravelTales",
//   html:`<h1>Hello from TravelTales <strong>subharti ki chut kali hai</strong></h1>`,
//   bcc:"sandipresponse256@gmail.com"
// }
// transport.sendMail(mailOptions,(error,info)=>{
// if(error){
//   console.log("Error sending email:",error);

// }
// else{
//   console.log("Email sent successfully:",info.response);
// }

// })








app.use("/api/auth", authRoutes);

app.use("/api/user",userRoutes)

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🔥 Server running on http://localhost:${PORT}`);
});
