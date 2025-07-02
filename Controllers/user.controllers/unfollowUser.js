import User from "../../models/User.js"


const unfollowUser =async (req,res)=>{
    const {id}=req.params

    const {user} = req

    try {
        if(user._id.toString()===id.toString()){
            return res.status(400).send({message:"you cannot unfollow your self"})
        }

        const targetUserToUnfollow = await User.findById(id)


        if(!targetUserToUnfollow){
            return res.status(404).json({message:"no user found to unfollow"})
        }       


        if (user.isBanned || targetUserToUnfollow.isBanned) {
            return res.status(403).json({ message: "Cannot follow a banned user" });
          }
          if (user.isDeactivated || targetUserToUnfollow.isDeactivated) {
            return res.status(403).json({ message: "Cannot follow a deactivated account" });
          }

        

        const isFollowing= user.following?.some(userId=>userId.toString() === targetUserToUnfollow._id.toString())

        if(!isFollowing){
            return res.status(400).json({message:"you cannot unfollow as you not followed the user"})
        }

        await targetUserToUnfollow.updateOne(
            {$pull:{followers:user._id}}
            )


        await user.updateOne(
            {$pull:{following:targetUserToUnfollow._id}}
            )

        return res.status(200).json({
            message:`You unfollowed the user ${targetUserToUnfollow.username}`
            
        })



    } catch (error) {
        return res.status(500).json({message:"Intenal server error"})
    }




}

export default unfollowUser