import Trip from "../../models/trip.js";

const addNote = async(req,res)=>{
    const{body, isPinned}=req.body
    const{ user } =req;
    const {tripId} = req.params;

    try {
        if(!body){
            return res.status(400).json({message:"Body is missing for the note"})
        }    
        const trip = await Trip.findById(tripId)
        if(!trip){
            return res.status(404).json({message:"No trip found"})
        }
        const isOwner =trip.isOwnedBy(user._id);
        const isCollaborator = trip.isFriendAccepted(user._id);
        if(!isOwner && !isCollaborator){
            return res.status(403).json({message:"You are Unauthorized to create a note on this trip"})
        }
        trip.notes.push({
            body,
            createdBy:user._id,
            isPinned: !!isPinned
        })
        await trip.save();
        return res.status(200).json({
            success:true,
            message:"note have been added successfully in this trip",
            
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
export default addNote