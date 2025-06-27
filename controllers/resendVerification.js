import User from "../models/User.js"
import { sendEmail } from "../utils/transportEmail.js"; 
import {validationResult} from "express-validator";

const resendVerification = async (req, res) => {
    // Step 1: Validate incoming request body
    const errors = validationResult(req);
    if(!errors.isEmpty()){
        return res.status(400).json({errors: errors.array()});
    }

const {email}= req.body 
try{
if(!email){
    return res.status(400).send({message:"Email is required"})
}

    // finding the user who have a registered email
 const existingUser=await User.findOne({email})

 //if no user by that email then register again
 if(!existingUser){
    return res.status(404).send({message:"User is not found register again"})
 }

    //if user is found but not verified then resend the verification email
    if(existingUser.isVerified){
        return res.status(200).send({message:"Email is already verified"})
    }

    if(existingUser.isDeactivated){
        return res.status(403).send({message:"User is deactivated"})
    }

    if(existingUser.isBanned){
        return res.status(403).send({message:"User is Banned from TravelTales"})
    }
    //if user is found and the expiry didnt passed then wait

    if(existingUser.emailVerifyTokenExpires && existingUser.emailVerifyTokenExpires >Date.now()){
        return res.status(200).send({message:"Please wait for the previous verification link to expire."})
    }
    const rawToken = existingUser.createEmailVerificationToken();
    await existingUser.save(); // Save updated token
    await sendEmail(email, existingUser.username, rawToken);
 
    return res.status(200).send({message:"Please verify your email. A new link has been sent."})




}catch(error){
    console.error("Error in resendVerification:", error);
    return res.status(500).json({message:"Internal server error"})


}

}

export default resendVerification;