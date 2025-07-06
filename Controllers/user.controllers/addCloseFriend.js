import User from "../../models/User.js"

const addCloseFriend = async (req,res)=>{
const {id}=req.params
const {user}=req

try {
        
    if(user.isBanned){
       return res.status(403).send({message:"your account has been banned"})
    }
    if(user.isDeactivated){
       return res.status(403).send({message:"your account has been deactivated"})
    }

    const goingToBeCloseFriend= await User.findById(id).select("closeFriends blockedUsers isDeactivated isBanned username")

    if(goingToBeCloseFriend.isBanned){
        return res.status(403).send({message:"The account has been banned of that user"})
    }
    if(goingToBeCloseFriend.isDeactivated){
        return res.status(403).send({message:"The account has been deactivated by that user"})
    }

   const isBlocked = user.blockedUsers?.some(id=> id.toString() === goingToBeCloseFriend._id.toString())

   const hasBlocked = goingToBeCloseFriend.blockedUsers?.some(id=> id.toString() === user._id.toString())

   if(isBlocked || hasBlocked){
        return res.status(400).send({message:"you cannot add him as Close Friends"})
   }

// am i following the user 
   const isFollowing =  user.following?.some(id=>id.toString() === goingToBeCloseFriend._id)
   
   //if not then follow first
   if(!isFollowing){
    return res.status(400).send({message:"Follow the user first to add him as Close Friend"})
   }

   // if i already added as close friend
   const alreadyCloseFriend = user.closeFriends?.some(id=>id.toString()=== goingToBeCloseFriend._id)

   if (alreadyCloseFriend) {
    return res.status(400).send({message:`you and ${goingToBeCloseFriend.username} are already close friends`})
   }
  

   
   user.closeFriends.push(goingToBeCloseFriend._id)
   
   await user.save()

   return res.status(200).send({message:`you added ${goingToBeCloseFriend.username} as your Close Friend now`})


} catch (error) {

    return res.status(500).send({message:"internal Server error"})
}


}

export default addCloseFriend
