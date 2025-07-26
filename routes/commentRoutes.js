import express from "express"
import { protect } from "../middlewares/authMiddleware";
import createRootComment from "../Controllers/comment.controllers/createRootComment";

const router = express.Router();



//create an root level comment on the post
router.post("/:postId", protect , createRootComment)














export default router