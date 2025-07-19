import Trip from "../../models/trip.js";

const deleteNote = async()=>{

    const { tripId , noteId } =req.params;
    const { user } =req;

    try {
        
        const trip = await Trip.findById(tripId);
        if(!trip){
            return res.status(404).json({message:"No trip found"})
        }
        const isOwner = trip.isOwnedBy(user._id);

        const note = trip.notes.find(note=>{
            if(note._id.toString()=== noteId.toString()){
                return note;
            }
        })
        if(!note){
            return res.status(404).json({message:"Note not Found"})
        }

        const isCreatedBy = note.createdBy.toString() === user._id.toString()

        if(!isOwner && !isCreatedBy){
            return res.status(403).json({message:"Only the trip owner or the colaborator who created the note can delete the note"})
        }

        trip.notes = trip.notes.filter(note=>note._id.toString() !== noteId.toString());

        await trip.save();

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
export default deleteNote