import express from "express";
import {
  registeruser,
  loginuser,
  logoutuser,
  refresh,
  getUserInfo
} from "../controllers/authController.js";

import { protect } from "../middlewares/authMiddleware.js";
// import { validateRegister, validateLogin } from "../middlewares/validateAuthInput.js";

const router = express.Router();

router.post("/register", registeruser); // + validateRegister
router.post("/login", loginuser);       // + validateLogin
router.post("/logout", protect, logoutuser);
router.post("/refresh", refresh);
router.get("/me", protect, getUserInfo);

export default router;
