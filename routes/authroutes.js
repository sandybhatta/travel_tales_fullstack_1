import express from "express";
import {
  registeruser,
  loginuser,
  logoutuser,
  refresh,
  getUserInfo,
  forgetPassword,
  resetPassword,
  changePassword,
  deactivateUser,
  reactivateUser
} from "../auth.controllers/authController.js";

import {verifyOtpLogin} from "../auth.controllers/verifyOTPLogin.js";

import {verifyEmail} from "../auth.controllers/verificationEmailApi.js"

import resendVerification from "../auth.controllers/resendVerification.js";
import {resendOtp} from "../auth.controllers/resendOtp.js";

// imported express-validator
import {body} from "express-validator";


import { protect } from "../middlewares/authMiddleware.js";
// import { validateRegister, validateLogin } from "../middlewares/validateAuthInput.js";

const router = express.Router();


// 1 for registering user
//for registering user
router.post("/register",[
  body("email").isEmail().withMessage("Please enter a valid email address"),
  body("username")
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters long")
    .notEmpty()
    .withMessage("Username is required"),
    
], registeruser); // + validateRegister


//for verifying email
router.post("/verify-email",verifyEmail)

//for resend verification email
router.post("/resend-verification",
body("email").isEmail().withMessage("Please enter a valid email address"),
resendVerification)




//2 for logging in user
router.post("/login", loginuser);       // + validateLogin

router.post("/otp-login",[
  body("otp").isLength({ min: 6, max:6 }).withMessage("OTP must be 6 digits")], 

  verifyOtpLogin); // OTP login



router.post("/resend-otp", resendOtp)




// 3. refresh route for token rotation
router.post("/refresh", refresh);

// 4 logout the user
router.post("/logout", protect, logoutuser);





// forgot password
router.post("/forget-password",
[
  body("email").isEmail().withMessage("provide a valid email")],
  forgetPassword)


//reset password after the forget email verification 
router.post("/reset-password",resetPassword)


//change password for logged in user 
router.post("/change-password", protect,changePassword )





router.post("/deactivate-user",protect, deactivateUser)

router.post("/reactivate-user", reactivateUser)


router.get("/me", protect, getUserInfo);

export default router;
