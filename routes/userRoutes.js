import express from "express"

import { protect } from "../middlewares/authMiddleware.js"



import deleteUser from "../Controllers/user.controllers/deleteUser.js"


import updateProfile from "../Controllers/user.controllers/updateProfile.js"

import changeusername from "../Controllers/user.controllers/changeusername.js"
import changeEmail from "../Controllers/user.controllers/changeEmail.js"
import verifyEmailChange from "../Controllers/user.controllers/verifyEmailChange.js"
import followUser from "../Controllers/user.controllers/followUser.js"
import unfollowUser from "../Controllers/user.controllers/unfollowUser.js"
import followerOfId from "../Controllers/user.controllers/followerOfId.js"
import followingOfUser from "../Controllers/user.controllers/followingOfUser.js"
import mutualFollowers from "../Controllers/user.controllers/mutualFollowers.js"















const router=express.Router()


// to delete the user and the documents from other models too
router.delete("/delete",protect, deleteUser)




// to update the profile

router.patch("/update-profile",protect,updateProfile)


// to change the username

router.patch("/change-username",protect, changeusername)



// to change and verify email change
router.patch("change-email",protect,changeEmail)

router.post("/verify-email-change",protect,verifyEmailChange)


// to follow someone
router.post("/follow/:id",protect,followUser)


// to unfollow someone
router.post("/unfollow/:id",protect,unfollowUser)

// to see the target user's followers

router.get("/:id/followers",protect, followerOfId)

// to see the target user's following

router.get("/:id/following",protect, followingOfUser)

// to see the mutual followers

router.get("/:id/mutual-follower",protect, mutualFollowers)


// to suggest someone to the user

















export default router