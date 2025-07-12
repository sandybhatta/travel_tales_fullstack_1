import Trip from "../../models/trip.js";


const getinvitedsOfTrip = async(req,res)=>{
const {tripId} = req.params;
const {user}=req;
try {
    if(!tripId){
        return res.status(400).json({message:"no trip id given"})
    }

    const trip = await Trip.findById(tripId).select("invitedFriends user title").populate([
        {
            path:"invitedFriends",
            select:"name username avatar"
        },
        {
            path:"user",
            select:"name username avatar"
        }
    ])
    if(!trip){
        return res.status(404).json({message:"No trip was found"});
    }
    const isOwner = trip.isOwnedBy(user._id);
    const isCollaborator = trip.isFriendAccepted(user._id);
    if(!isOwner && !isCollaborator){
        return res.status(403).json({message:"Only the owner and collaborators can see the invited list of this trip"})
    }

    res.status(200).json({
        success: true,
        owner:trip.user,
        title:trip.title,
        invitedFriends: trip.invitedFriends,
        invitedFriendsCount: trip.invitedFriends?.length || 0,
        isOwner,
      });
    } catch (error) {
      console.error("Error fetching trip collaborators:", error);
      return res.status(500).json({ success: false, message: "Internal Server Error" });
    }
}
export default getinvitedsOfTrip


