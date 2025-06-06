// index.js
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { connectDb } from "./config/db.js";
import authRoutes from "./routes/authroutes.js"

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


app.use("/api/auth", authRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🔥 Server running on http://localhost:${PORT}`);
});
