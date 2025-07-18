
import Trip from "../../models/trip.js";

const restoreAllTrip = async (req,res)=>{
const {user}=req;

try {

    const archivedTripsOfTheUser = await Trip.find({user:user._id , isArchived:true})

    if(archivedTripsOfTheUser.length===0){
        return res.status(200).json({message:"there are no archived trips to be restored"})
    }

    await Trip.updateMany(
        {user:user._id,isArchived:true},
        {$set:{isArchived:false}}
        )

        return res.status(200).json({message:`${archivedTripsOfTheUser.length} trips are restored`})


} catch (error) {
    return res.status(500).json({
        message: "Internal Server Error",
        error: error.message,
      });
}

}
export default restoreAllTrip