import { validationResult } from "express-validator";
import User from "../models/User.js";
import { sendEmail } from "../utils/transportEmail.js"; 
import { sendOTPEmail } from "../utils/sendOTPemail.js";
import  OtpToken from "../models/Otp.js";
import {verifyToken} from "../utils/tokenCreate.js"
import Token from "../models/token.js"
import dotenv from "dotenv"
import { sendDeactivateEmail } from "../utils/sendDeactivateEmail.js";

import {sendPasswordChangedEmail} from "../utils/sendPasswordChanged.js"


import {sendReactivationEmail} from "../utils/sendReactivationEmail.js"



dotenv.config()
// importing token function of both refresh and access

import { getRefreshToken, getAccessToken } from "../utils/tokenCreate.js";







export const registeruser = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) return res.status(400).json({ errors: errors.array() });

  const { name, email, username, password, location } = req.body;

  try {
    const existingEmail = await User.findOne({ email });
    const existingUsername = await User.findOne({ username });

    if (existingEmail?.isVerified) {
      return res.status(400).json({ message: "Email is already in use." });
    }

    if (existingEmail?.isDeactivated) {
      return res.status(403).json({
        message: "Account is deactivated. Please reactivate your account in the login page",
      });
    }
    if (existingEmail?.isBanned) {
      return res.status(403).json({
        message: "Account is Banned from TravelTales",
      });
    }

    if (existingUsername?.isVerified) {
      return res.status(400).json({ message: "Username is already taken." });
    }

    if (existingUsername?.isDeactivated) {
      return res.status(403).json({
        message: "This username is linked to a deactivated account.",
      });
    }

    if (
      existingEmail &&
      !existingEmail.isVerified &&
      existingEmail.emailVerifyTokenExpires &&
      existingEmail.emailVerifyTokenExpires > Date.now()
    ) {
      return res.status(400).json({
        message: "Please wait until the previous verification email expires.",
      });
    }

    if (existingEmail && !existingEmail.isVerified) {
      const rawToken = existingEmail.createEmailVerificationToken();
      await existingEmail.save();
      await sendEmail(email, username, rawToken);
      return res.status(200).json({
        message: "Please verify your email. A new link has been sent.",
      });
    }

    const newUser = new User({ name, email, username, password, location });
    const rawToken = newUser.createEmailVerificationToken();
    await newUser.save();
    await sendEmail(email, username, rawToken);

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

// for deactivated user
if(user.isDeactivated){
  return res.status(403).send({
    message: "Your account is deactivated. Reactivate to continue.",
    allowReactivation: true, // so that frontend knows the error is for deactivated account and show reactivate button
    userId: user._id // to prefill form in reactivate button
  });
}


const otpOfUser=await OtpToken.findOne({user:user._id, type:"login"})

if(otpOfUser && otpOfUser.expiresAt > Date.now() ){

  return res.status(400).json({
    message: "Please wait until the previous OTP email expires.",
  });
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





export const refresh = async (req, res) => {
  const oldToken = req.cookies.refreshToken;

  if (!oldToken) {
    return res.status(401).json({ message: "No refresh token found." });
  }

  try {
    const payload = verifyToken(oldToken, process.env.JWT_REFRESH_SECRET);

    const existingToken = await Token.findOne({ token: oldToken });

    if (!existingToken) {
      await Token.deleteMany({ userId: payload.userId }); // Token reuse detection
      return res.status(403).json({ message: 'Token reuse detected. Re-login required.' });
    }

    // 🧠 Fetch user
    const user = await User.findById(payload.userId);
    if (!user) {
      await existingToken.deleteOne();
      return res.status(401).json({ message: "User not found." });
    }

    // ❌ If user is deactivated, deny token refresh
    if (user.isDeactivated) {
      await existingToken.deleteOne(); // Cleanup old token
      return res.status(403).json({ message: "Account is deactivated. Reactivate to continue." });
    }

    // ✅ Valid refresh - rotate token
    await existingToken.deleteOne();

    const newAccessToken = getAccessToken(user._id);
    const newRefreshToken = await getRefreshToken(user._id);

    res.cookie("refreshToken", newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.json({ accessToken: newAccessToken });
  } catch (error) {
    console.error("Error in /refresh route:", error.message);
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};





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

    if (user && user.isDeactivated){
      return  res.status(403).send({ message: "User is deactivated , login to reactivate your account" });
    }
    if (user.isBanned) {
      return res.status(403).send({ message: "You are banned from TravelTales." });
    }


    const otpOfUser=await OtpToken.findOne({user:user._id, type:"reset_password"})

    if(otpOfUser && otpOfUser.expiresAt > Date.now() ){

      return res.status(400).json({
        message: "Please wait until the previous OTP email of forget password expires.",

        });
    }
   
    // Generate token


    const otpToken= await OtpToken.generateOtpForUser(user._id, "reset_password")

    await sendOTPEmail(user.email, user.username,otpToken,"reset_password");


   
    // Send reset email (pass rawToken)
  
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



   const user= await User.findOne({email})

   if(!user){
    return res.status(400).send({message:"no such user by that email  or the token expired"})
   }

   const otpOfUser = await OtpToken.findOne({user:user._id, type:"reset_password"})

   if(!otpOfUser){
    return res.status(400).send({message:"invalid otp"})
   }

   const isValid = await otpOfUser.isValidOtp(token)
   
   if(!isValid){
    return res.status(400).send({message:"otp did not match"})
   }
 
 


   user.password=password
   await user.save()
   return res.status(200).send({message:"password have been changed successfully"})

  }catch(err){
return res.status(500).send({message:"password didnt changed, internal error"})
  }
}





export const changePassword = async(req,res)=>{
 
  const {oldPassword, newPassword}=req.body

  if(!oldPassword || !newPassword){
    return res.status(400).send({message:"provide both old password and the new password"})
  }

  try{
    if(req.user.isDeactivated){
      return res.status(400).send({message:"cannot change password , user is deactivated"})
    }
    const isMatch= await req.user.comparePassword(oldPassword)

    if(!isMatch){
      return res.status(400).send({message:"password did not match"})
    }
    req.user.password=newPassword
    await req.user.save()
  

    await sendPasswordChangedEmail(req.user.username, req.user.email);

    return res.status(200).send({message:"password changed successfully"})
  


  }catch(error){
    return res.status(500).send({message:"password did not changed, internal server error "})

  }
  

}








export const deactivateUser =async(req,res)=>{
 
  const {user} = req
  const {deactivationReason}=req.body

  try{
    if(user.isDeactivated){
      return res.status(400).send({message:"your account is already deactivated"})
    }

    if (user.deactivatedDate && Date.now() - new Date(user.deactivatedDate).getTime() > 30 * 24 * 60 * 60 * 1000) {
      return res.status(400).send({ message: "Cannot deactivate your account after 30 days of last deactivation" });
    }
    

    user.isDeactivated=true;
    user.deactivatedDate=new Date()
    user.deactivationReason=deactivationReason || "no reason at all"

    await user.save()
  
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
    });
    
    const token =await Token.findOne({userId:user._id})

    if(token){
      await token.deleteOne()
    }
    
    await sendDeactivateEmail(user.email,user.username)

    return res.status(200).send({message:"Account Deactivated successfully, to reactivate go to the login page and reactivate your account"})
  
  }catch(error){
    console.error("Deactivate Error:", error);
return res.status(500).json({ message: "Something went wrong while deactivating account." });
  }

  


}





export const reactivateUser =  async(req,res)=>{
  
    const {userId}=req.body

    try{
      const user = await User.findById(userId)

      if(!user){
        return res.status(404).send({message:"user not found"})
      }

      if(user.isBanned){
        return res.status(400).send({message:"user is Banned from TravelTales"})
      }
      if (!user.isDeactivated) {
        return res.status(400).send({ message: "Account is already active" });
      }

      user.isDeactivated = false;
      user.deactivationReason = undefined;

      await user.save();
      await sendReactivationEmail(user.email,user.username)

      return res.status(200).send({ message: "Account reactivated. You can now log in." });
    }catch(err){

    }

}


export const getUserInfo =  async(req,res)=>{
  
    const {userId}=req.body

}