import express from "express"
import { protect } from "../middlewares/authMiddleware";
import { upload } from "../middlewares/multer";
import createPost from "../Controllers/post.controllers/createPost";
import getPostDetails from "../Controllers/post.controllers/getPostDetails";
import editPost from "../Controllers/post.controllers/editPost";
import sharePost from "../Controllers/post.controllers/sharepost";
const router = express.Router();






//create a new post
router.post("/",upload.array("post",20), protect, createPost)

// get post details
router.get("/:postId",protect, getPostDetails)

router.post("/:postId/share", protect , sharePost)
// to edit a post
// router.patch("/:postId" , protect , editPost)




export default router;