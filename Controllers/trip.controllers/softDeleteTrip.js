import Trip from "../../models/trip.js"

const softDeleteTrip = async (req,res)=>{
const {tripId} = req.params;
const {user} = req;

    if(!tripId){
        return res.status(400).send({message:"trip id was not provided"})
    }

try {
    
    const trip = await Trip.findById(tripId).select("isArchived")

    if(!trip){
        return res.status(404).json({message:"trip not found"})
    }


    const isOwner = trip.isOwnedBy(user._id)
    if(!isOwner){
        return res.status(400).json({message:"you are not the owner of this trip to delete it"})
    }

    if(trip.isArchived){
        return res.status(400).json({message:"The trip is already soft deleted"})
    }
     
    trip.isArchived=true;
    await trip.save();
    return res.status(200).json({message:"This trip is soft deleted successfully."})

} catch (error) {
    return res.status(500).json({message:"Internal server error"})
}
}

export default softDeleteTrip