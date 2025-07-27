import express from "express"
import { protect } from "../middlewares/authMiddleware";
import createRootComment from "../Controllers/comment.controllers/createRootComment";
import getRootComment from "../Controllers/comment.controllers/getRootComment";
import replyOfComment from "../Controllers/comment.controllers/replyOfComment";
import getReply from "../Controllers/comment.controllers/getReply";
import editComment from "../Controllers/comment.controllers/editComment";
import likeUnlikeComment from "../Controllers/comment.controllers/likeunlikecomment";

const router = express.Router();



//create an root level comment on the post
router.post("/:postId", protect , createRootComment)


// reply to a comment or reply to a reply
router.post("/:postId/:rootCommentId/:parentCommentId/reply", protect , replyOfComment)


// get root level comments on a post
router.get("/:postId", protect, getRootComment)


// get replies of a root comment or replies of replies
router.get("/:postId/:parentCommentId",protect , getReply)



// edit a comment or reply
router.patch("/:commentId", protect, editComment)






// like unlike a comment
router.post(":commentId/like", protect, likeUnlikeComment)


export default router