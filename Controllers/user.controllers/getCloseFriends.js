import User from "../../models/User.js"


const getCloseFriends = async (req, res)=>{

    try {
        const {user}=req
    
    if(!user.closeFriends || user.closeFriends.length === 0){
        return res.status(200).json({message:" you have no close friends"})
    }
    let closeFriends= await User.find({
        _id:{$in:user.closeFriends},
        isDeactivated:false,
        isBanned:false
        }).select("name username avatar")

  

    return res.status(200).json({closeFriends})

    } catch (error) {
         return res.status(500).json({ message: "Something went wrong" });
    }
}
export default getCloseFriends;