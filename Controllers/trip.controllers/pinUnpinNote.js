import Trip from "../../models/trip.js";

const pinUnpinNote = async (req,res)=>{

    try {
        
        const { tripId , noteId } = req.params;
        const { user } = req;
        
        const trip = await Trip.findById(tripId);
        if(!trip){
            return res.status(404).json({message:"No trip found"})
        }
        const isOwner = trip.isOwnedBy(user._id);
        const isCollaborator = trip.isFriendAccepted(user._id);

        if(!isOwner && !isCollaborator){
            return res.status(403).json({message:"Only owner or collaborator can pin and unpin a post"})
        }
        const note = trip.notes.find(note => note._id.toString() === noteId);

        if(!note){
            return res.status(404).json({message:"No note found"})
        }
        note.isPinned =!note.isPinned;
        await trip.save()

        return res.status(200).json({
            success:true,
            notes:trip.notes.sort((a,b)=>{
                if(a.isPinned !== b.isPinned){
                    return b.isPinned - a.isPinned
                }
                return new Date(b.createdAt) - new Date(a.createdAt)
            })
        })

    } catch (error) {
        return res.status(500).json({
            message: "Internal Server Error",
            error: error.message, 
          });
    }
}
export default pinUnpinNote