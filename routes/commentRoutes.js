import express from "express"
import { protect } from "../middlewares/authMiddleware";
import createRootComment from "../Controllers/comment.controllers/createRootComment";

const router = express.Router();



//create an root level comment on the post
router.post("/:postId", protect , createRootComment)


// reply to a comment or reply to a reply
router.post("/:postId/:parentCommentId/reply", protect , )












export default router