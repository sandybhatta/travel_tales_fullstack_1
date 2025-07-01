

import express from "express"
import deleteUser from "../user.controllers/deleteUser.js"

import { protect } from "../middlewares/authMiddleware.js"
import updateProfile from "../user.controllers/updateProfile.js"














const router=express.Router()


// to delete the user and the documents from other models too
router.delete("/delete",protect, deleteUser)

// to update the profile

router.patch("/update-profile",protect,updateProfile)
