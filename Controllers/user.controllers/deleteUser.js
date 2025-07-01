import User from "../models/User.js";
import Comment from "../models/comment.js";
import Post from "../models/post.js";
import Trip from "../models/trip.js";
import Token from "../models/token.js"; // Assuming you have a token model


import { deleteCommentThread } from "../utils/deleteCommentThread.js";

const  deleteUser = async (req, res) => {
  const { user } = req;
  const { password } = req.body;

  try {
    // 1. Pre-checks
    if (user.isBanned) {
      return res.status(403).send({ message: "This account is banned from TravelTales" });
    }

    if (user.isDeactivated) {
      return res.status(400).send({ message: "This account is deactivated. Reactivate before deleting." });
    }

    // 2. Password verification
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return res.status(400).send({ message: "Incorrect password" });
    }

    const userId = user._id;

    // 3. Remove user from other users' follower/following/closeFriends
    await User.updateMany(
      { followers: userId }, // all the users where this user present as follower
      { $pull: { followers: userId } } // pull out from where? ==> followers || what? userId
    );
    await User.updateMany(
      { following: userId },
      { $pull: { following: userId } }
    );
    await User.updateMany(
      { closeFriends: userId },
      { $pull: { closeFriends: userId } }
    );

    // 4. Remove user from trips (invited/accepted)
    await Trip.updateMany(
      {$or:[
        {acceptedFriends:userId},
        {invitedFriends:userId}
      ]
    },
      {
        $pull: {
          invitedFriends: userId,
          acceptedFriends: userId,
        },
      }
    );

    // 5. Delete user's comments
    //  i) find every comment of the user 
    const commentsOfTheUser= await Comment.find({author:user._id})

    // ii) delete the comment and its child comments too
    // post order deletion(children first, then parent)
    for(let comment of commentsOfTheUser){
        await deleteCommentThread(comment._id)
    }

    // 6. Delete user's posts (manually to run pre hooks)
    const posts = await Post.find({ author: userId });
    for (let post of posts) {
      await post.deleteOne();
    }

    // 7. Delete user's trips
    await Trip.deleteMany({ user: userId });

    // 8. Remove user from bookmarks and likes
    await Post.updateMany(
        {
            $or: [
              { bookmarkedBy: userId },
              { likes: userId },
            ],
          },
      {
        $pull: {
          bookmarkedBy: userId,
          likes: userId,
        },
      }
    );

    // 9. Delete auth tokens
    await Token.deleteMany({ userId });

    // 10. Finally, delete the user
    await User.findByIdAndDelete(userId);

    // 11. Clear cookie if set
    res.clearCookie("refreshToken", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "none",
    });

    return res.status(200).json({ message: "Account deleted successfully" });
  } catch (error) {
    console.error("User deletion failed:", error);
    return res.status(500).send({ message: "Internal server error" });
  }
};



export default deleteUser;