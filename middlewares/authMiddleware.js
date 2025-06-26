
import jwt from "jsonwebtoken";
import User from "../models/User.js";
import {verifyToken} from "../utils/tokenCreate.js"
import User from "../models/User.js"

import dotenv from "dotenv"
dotenv.config()



export const protect = async (req, res, next) => {
    const authHeader = req.headers.authorization;
  
    // 1. Check if Authorization header is present
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token received" });
    }
  
    const token = authHeader.split(" ")[1];
  
    try {
      // 2. Verify token
      const payload = verifyToken(token, process.env.JWT_ACCESS_SECRET);
  
      // 3. Check if user still exists
      const user = await User.findById(payload._id).select("-password");
      if (!user) {
        return res.status(401).json({ message: "User no longer exists" });
      }
  
      // 4. Attach user to request
      req.user = user;
      next();
    } catch (error) {
      if (error.name === "TokenExpiredError") {
        return res.status(401).json({ message: "Token expired" });
      }
  
      return res.status(401).json({ message: "Invalid token" });
    }
    
  };
  