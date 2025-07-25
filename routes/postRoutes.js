import express from "express"
import { protect } from "../middlewares/authMiddleware";
import { upload } from "../middlewares/multer";
import createPost from "../Controllers/post.controllers/createPost";
import getPostDetails from "../Controllers/post.controllers/getPostDetails";
import editPost from "../Controllers/post.controllers/editPost";
import sharePost from "../Controllers/post.controllers/sharepost";
import toggleLikePost from "../Controllers/post.controllers/togglelikePost";
import getLikesOfPost from "../Controllers/post.controllers/getLikesOfPost";
import postsLikedByUser from "../Controllers/post.controllers/postsLikedByUser";
import mentionedPost from "../Controllers/post.controllers/mentionedPost";
import myPost from "../Controllers/post.controllers/myPost";
const router = express.Router();






//create a new post
router.post("/",upload.array("post",20), protect, createPost)

// get post details
router.get("/:postId",protect, getPostDetails)

//share a post
router.post("/:postId/share", protect , sharePost)

// to edit a post
router.patch("/:postId" , protect , editPost)


// toggle like a post
router.patch("/:postId/like", protect , toggleLikePost)



// get all the users who liked the post
router.get("/:postId/likes", protect, getLikesOfPost)


// get all post liked by the current user
router.get("/liked-posts" , protect , postsLikedByUser)


// posts that the user has been mentioned
router.get("/mentioned-posts", protect , mentionedPost)

// posts that current user have made
router.get("/me", protect , myPost)











export default router;