import { validationResult } from "express-validator";
import User from "../models/User.js";
import { sendEmail } from "../utils/transportEmail.js"; 
import { sendOTPEmail } from "../utils/sendOTPemail.js";
import  OtpToken from "../models/Otp.js";
import {verifyToken} from "../utils/tokenCreate.js"
import Token from "../models/token.js"
import dotenv from "dotenv"
import crypto from "crypto"
import {forgetPasswordEmail} from "../utils/sendForgetPassword.js"

dotenv.config()
// importing token function of both refresh and access

import { getRefreshToken, getAccessToken } from "../utils/tokenCreate.js";


export const registerUser = async (req, res) => {
  // Step 1: Validate incoming request body
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }

  const { email, username, password, location } = req.body;

  try {
    // Step 2: Check if email already exists
    const existingEmail = await User.findOne({ email });

    if (existingEmail && existingEmail.isVerified) {
      return res.status(400).json({ message: "Email is already in use." });
    }

    if (existingEmail && !existingEmail.isVerified) {
      // Reuse unverified account: generate new token and resend
      const rawToken = existingEmail.createEmailVerificationToken();
      await existingEmail.save(); // Save updated token
      await sendEmail(email, username, rawToken);
      return res
        .status(200)
        .json({ message: "Please verify your email. A new link has been sent." });
    }

    // Step 3: Check if username is taken (only if verified)
    const existingUsername = await User.findOne({ username });
    if (existingUsername && existingUsername.isVerified) {
      return res.status(400).json({ message: "Username is already taken." });
    }

    // Step 4: Create new user instance
    const newUser = new User({
      email,
      username,
      password,
      location,
    });

    // Step 5: Generate and attach verification token
    const rawToken = newUser.createEmailVerificationToken();

    // Step 6: Save user to DB (so hashed token is stored)
    await newUser.save();

    // Step 7: Send verification email
    await sendEmail(email, username, rawToken);

    // Step 8: Respond success
    res.status(201).json({
      message: "Registration successful! Check your email to verify your account.",
    });
  } catch (err) {
    console.error("Registration Error:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};


export const loginuser =async (req,res)=>{

// Step 1: Validate input
const{email,password}=req.body

if(!email || !password){
    return res.status(400).send({message:"provide email and password both"})
}





try{

// Check if user exists and is verified
const user=await User.findOne({email}).select("+password")

if(!user){
    return res.status(400).send({message:"Invalid credentials"})
}
const match = await user.comparePassword(password)
if(!match){
    return res.status(400).send({message:"Invalid credentials"})
}
if(!user.isVerified){
    return res.status(403).send({message:"Please verify your email before logging in."});
}
if(user.isBanned){
    return res.status(403).send({message:"You are banned from this platform."});
}
    
    const otp= await OtpToken.generateOtpForUser(user._id, "login"); 
    await sendOTPEmail(user.email, user.username,otp);
    res.status(200).json({
      message: "verify the otp sent to your email",
      user: user._id
    })

}catch(error){
    console.error("Login Error:", error);
    return res.status(500).send({message:"Server error"})
}


}





export const refresh=async(req,res)=>{

  // extracted the old token from cookies
  const oldToken = req.cookies.refreshToken;

  if (!oldToken) {
    return res.status(401).json({ message: "No refresh token found." });
  }

  try{


    const payload = verifyToken(oldToken, process.env.JWT_REFRESH_SECRET);

  
    const existingToken = await Token.findOne({ token: oldToken });
    
    if (!existingToken) {
      await Token.deleteMany({ userId: payload.userId });
      return res.status(403).json({ message: 'Token reuse detected. Re-login required.' });
    }
    
    // Remove old token, issue new one
    await existingToken.deleteOne();
    const newAccessToken = getAccessToken(payload.userId);
    const newRefreshToken =  await getRefreshToken(payload.userId);
    
    
    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  
  
    res.json({ accessToken: newAccessToken });

  }catch(error){
    console.error("Error in /refresh route:", error.message);
  return res.status(401).json({ message: "Invalid or expired token." });
  }

  
  


}





export const logoutuser = async (req, res) => {
  try {
    // Delete refresh token from DB
    await Token.deleteMany({ userId: req.user._id });

    // Clear the refresh token cookie
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
    });

    res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    res.status(500).json({ message: "Server error while logging out" });
  }
};







export const forgetPassword = async (req, res) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).send({ message: errors.array() });
  }

  const { email } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user || !user.isVerified) {
      return res.status(400).send({ message: "Register yourself first." });
    }

    if (user.isBanned) {
      return res.status(403).send({ message: "You are banned from TravelTales." });
    }

    if (user.passwordResetExpires && user.passwordResetExpires > Date.now()) {
      return res.status(429).send({ message: "Wait 15 minutes before retrying." });
    }

    // Generate token
    const rawToken = crypto.randomBytes(32).toString("hex");
    const hashedToken = crypto.createHash("sha256").update(rawToken).digest("hex");

    user.passwordResetToken = hashedToken;
    user.passwordResetExpires = Date.now() + 15 * 60 * 1000;
    await user.save();

    // Send reset email (pass rawToken)
    await forgetPasswordEmail(user.email, user.username, rawToken);

    return res.status(200).send({
      message: "Reset password email sent. Check your inbox.",
    });
  } catch (err) {
    console.error(err);
    return res.status(500).send({ message: "Something went wrong." });
  }
};






export const resetPassword=async(req,res)=>{

  // extract the new password and the token from body

  const {token , password,email}=req.body

  if(!token || !password || !email){
   return  res.status(401).send({message:"invalid credentials provide the token and password and email"})
  }

  try{
 const hashedToken= crypto.createHash("sha256").update(token).digest("hex")
   const user= await User.findOne({email,passwordResetToken:hashedToken,
  passwordResetExpires:{$gt:Date.now()}})

   if(!user){
    return res.status(400).send({message:"no such user by that email  or the token expired"})
   }

   user.passwordResetToken=undefined
   user.passwordResetExpires=undefined
 


   user.password=password
   await user.save()
   return res.status(200).send({message:"password have been changed successfully"})

  }catch(err){
return res.status(500).send({message:"password didnt changed, internal error"})
  }
}
