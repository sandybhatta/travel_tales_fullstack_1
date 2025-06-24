import express from "express";
import {
  registeruser,
  loginuser,
  logoutuser,
  refresh,
  getUserInfo
} from "../controllers/authController.js";


import {verifyEmail} from "../controllers/verificationEmailApi.js"

// imported express-validator
import {body} from "express-validator";


import { protect } from "../middlewares/authMiddleware.js";
// import { validateRegister, validateLogin } from "../middlewares/validateAuthInput.js";

const router = express.Router();

router.post("/register",[
  body("email").isEmail().withMessage("Please enter a valid email address"),
  body("username")
    .isLength({ min: 3 })
    .withMessage("Username must be at least 3 characters long")
    .notEmpty()
    .withMessage("Username is required"),
    body("password").isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),
], registeruser); // + validateRegister
router.post("/login", loginuser);       // + validateLogin
router.post("/logout", protect, logoutuser);
router.post("/refresh", refresh);
router.get("/me", protect, getUserInfo);
router.post("/verify-email",verifyEmail)
export default router;
