import express from "express"

import { protect } from "../middlewares/authMiddleware.js"



import deleteUser from "../Controllers/user.controllers/deleteUser.js"


import updateProfile from "../Controllers/user.controllers/updateProfile.js"

import changeusername from "../Controllers/user.controllers/changeusername.js"














const router=express.Router()


// to delete the user and the documents from other models too
router.delete("/delete",protect, deleteUser)




// to update the profile

router.patch("/update-profile",protect,updateProfile)


// to change the username

router.patch("/change-username",protect, changeusername)



export default router