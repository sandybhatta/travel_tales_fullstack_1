import Trip from "../../models/trip.js";

const getNotes = async(req,res)=>{
try {
    const { user } = req
    const { tripId } = req.params;
    const trip = await Trip.findById(tripId).select("notes").populate("notes.createdBy" , "name username avatar")
    if (!trip) {
        res.status(404).json({message:"no trip found"})
    }
    const isOwner = trip.isOwner(user._id);
    const isCollaborator = trip.isFriendAccepted(user._id)
    
    if (!isOwner && !isCollaborator) {
        return res.status(403).json({message:"You are not authorized to see notes"})
    }
    return res.status(200).json({
        
        notes:trip.notes.sort((a, b) => {
            if (b.isPinned !== a.isPinned) {
              return b.isPinned - a.isPinned;
            }
            return new Date(b.createdAt) - new Date(a.createdAt); 
          })
    })

} catch (error) {
    return res.status(500).json({
        message: "Internal Server Error",
        error: error.message, 
      });
}

}

export default getNotes;