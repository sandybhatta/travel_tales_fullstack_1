

import express from "express"
import{
    deleteUser
} from "../user.controllers/deleteUser.js"

import { protect } from "../middlewares/authMiddleware.js"














const router=express.Router()



router.delete("/delete",protect, deleteUser)