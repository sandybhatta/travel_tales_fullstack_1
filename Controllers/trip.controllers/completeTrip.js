import Trip from "../../models/trip.js";

const completeTrip =async(req,res)=>{
    const {tripId} =req.params;
    const {user} = req;
try {
    if(!tripId){
        return res.status(400).json({message:"trip id was not given"})
    }

    const trip = await Trip.findById(tripId)
    if(!trip){
        return res.status(404).json({message:"no trip found"})
    }
    
    const isOwner=trip.isOwnedBy(user._id)
    const isCollaborator = trip.isFriendAccepted(user._id)
    if(!isOwner && !isCollaborator){
        return res.status(403).json({message:"Unauthorized to change the trip completion"})
    }
    if(trip.isCompleted){
        return res.status(200).json({message:"The trip is already completed"})
    }
    trip.isCompleted=true;

    trip.endDate = new Date();

    await trip.save()

    return res.status(200).json({
        message: "Trip marked as completed",
        tripId: trip._id,
        isCompleted: true,
      });




} catch (error) {
    return res.status(500).send({message:"Internal Server error"})
}
}
export default completeTrip