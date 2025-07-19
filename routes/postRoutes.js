import express from "express"
import { protect } from "../middlewares/authMiddleware";
import { upload } from "../middlewares/multer";
import createPost from "../Controllers/post.controllers/createPost";
const router = express.Router();






//create a new post
router.post("/",upload.array("post",20), protect, createPost)


export default router;