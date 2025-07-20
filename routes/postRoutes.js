import express from "express"
import { protect } from "../middlewares/authMiddleware";
import { upload } from "../middlewares/multer";
import createPost from "../Controllers/post.controllers/createPost";
import getPostDetails from "../Controllers/post.controllers/getPostDetails";
const router = express.Router();






//create a new post
router.post("/",upload.array("post",20), protect, createPost)

// get post details
router.get("/:postId",protect, getPostDetails)
export default router;