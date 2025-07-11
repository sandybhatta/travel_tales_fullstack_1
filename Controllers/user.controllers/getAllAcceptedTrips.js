import Trip from "../../models/trip";



const getAllAcceptedTrips =async(req,res)=>{
const {user} = req;

try {
    const allAcceptedTrips = await Trip.find({acceptedFriends:user._id}).populate("user", "name username avatar").sort({startDate:-1})

    if(!allAcceptedTrips || allAcceptedTrips.length===0){
        return res.status(200).json({message:"you have not a part of a single trip yet"})
    }
    const response = allAcceptedTrips.map((trip) => ({
        id: trip._id,
        owner: trip.user,
        title: trip.title,
        photoUrl: trip.coverPhoto?.url || "",
        startDate: trip.startDate,
        endDate: trip.endDate,
        destinations: trip.destinations,
        duration: trip.duration,
        tags: trip.tags,
        tripStatus:trip.tripStatus
      }));
      return res.status(200).json({ trips: response });
  } catch (error) {
    console.error("Error fetching accepted trips:", error);
    return res.status(500).json({ message: "Internal Server Error" });
  }

}
export default getAllAcceptedTrips