import Trip from "../../models/trip.js";

const getPostsOfTrip = async ()=>{

    try {
        const {user} = req;
        const{tripId} = req.params;
        
        const trip = await Trip.findById(tripId);

        if(!trip){
            res.status(404).json({message:"No trip found"})
        }

        
    } catch (error) {
        return res.status(500).json({
            message: "Internal Server Error",
            error: error.message,
          });
    }
}
export default getPostsOfTrip