// index.js
import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import { connectDb } from "./config/db.js";


import authRoutes from "./routes/authroutes.js"
import userRoutes from "./routes/userRoutes.js"
import tripRoutes from "./routes/tripRoutes.js"


dotenv.config();


connectDb();

// 🚀 Create Express app
const app = express();


app.use(express.json()); 
app.use(cookieParser()); 
app.use(cors({
  origin: process.env.CLIENT_URL || "http://localhost:3000",
  credentials: true, 
}));





app.get("/", (req, res) => {
  res.send("🌍 API is running...");
});





app.use("/api/auth", authRoutes);

app.use("/api/user",userRoutes)

app.use("/api/trips", tripRoutes )






const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🔥 Server running on http://localhost:${PORT}`);
});
