import { validationResult } from "express-validator";
import User from "../models/User.js";
import { sendEmail } from "../utils/transportEmail.js"; 
import { sendOTPEmail } from "../utils/sendOTPemail.js";
import  OtpToken from "../models/Otp.js";

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


    // const refreshToken = await getRefreshToken(user._id);
    // const accessToken = getAccessToken(user._id);
    
    // user.lastLogin=Date.now()
    // await user.save({ validateBeforeSave: false });



    
    // secure in cookie means that the cookie 
    // will only be sent over HTTPS connections


    // res.cookie("refreshToken", refreshToken, {
    //   httpOnly: true,
    //   secure: process.env.NODE_ENV === "production", // Set to true in production with HTTPS
    //   sameSite: "none",
    //   maxAge: 7 * 24 * 60 * 60 * 1000,
    // } // 7 days
    // )

    
    //static method to generate OTP
    
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