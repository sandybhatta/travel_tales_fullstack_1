import Trip from "../../models/trip.js"

import cloudinary, { uploadToCloudinary } from "../../utils/cloudinary.js";
const editTrip = async(req,res)=>{

    const {tripId}=req.params;
    const {user}=req

    const {title, description ,tags ,startDate ,endDate ,destinations ,visibility ,travelBudget ,isArchived ,isCompleted ,coverPhoto , ...others  } = req.body
    if (!tripId) {
        res.status(400).json({message:"no trip id was given"})
    }

    try {
        if (others && Object.keys(others).length > 0) {
            return res.status(400).json({ message: "these edits can't be done here" });
          }
        const trip = await Trip.findById(tripId)
        if (!trip) {
           return res.status(404).json({message:"no trip was found"})
        }

        const isOwner = trip.isOwnedBy(user._id)

        // if not the owner then they dont have the permission
        if(!isOwner){
            return res.status(403).json({message:"you cannot edit the trip"})
        }

        //check for title and save
        if(title){
            if(title.length > 100){
                return res.status(400).json({message:"title should be under 100 characters only"})
            }

            trip.title=title
           
        }
        

        //check for description and save
        if(description){
            if(description.length > 1000){
                return res.status(400).json({message:"description should be under 1000 characters only"})
            }
           trip.description = description
        }
        

        //check for tags and save
        const allowedTagsSet = new Set( [
            "adventure", "beach", "mountain", "city", "honeymoon", "family",
            "solo", "friends", "luxury", "budget", "wildlife", "roadtrip", "spiritual"
          ])

        if(tags && tags.length > 0){
            for (let tag of tags) {
                if (!allowedTagsSet.has(tag)) {
                  return res.status(400).json({ message: "tags are not valid" });
                }
              }
            trip.tags=tags
        }

        if(startDate && endDate){
            if(new Date(startDate) > new Date(endDate)){
                return res.status(400).json({message:"start date should be before end date"})
            }

            trip.startDate=startDate
            trip.endDate=endDate
        }

        if(Array.isArray(destinations) && destinations.length >0){
            trip.destinations=destinations
        }

        const allowedVisibility= ["public", "followers", "close_friends","private"]

        if(visibility  && allowedVisibility.includes(visibility)){
            trip.visibility=visibility
        }

        if(travelBudget){

          
            const parsedBudget = parseInt(travelBudget);
            if (isNaN(parsedBudget) || parsedBudget < 0){
                return res.status(400).json({message:"travel budget should be grater than or equal to 0"})
             }
             trip.travelBudget=travelBudget

        }


        if(typeof isArchived ==="boolean"){
            trip.isArchived=isArchived
        }
        if(typeof isCompleted === "boolean"){
            trip.isCompleted=isCompleted
        }
        if(req.file && req.file.mimetype.startsWith("image/")){

            if (trip.coverPhoto?.public_id) {
                await cloudinary.uploader.destroy(trip.coverPhoto.public_id);
              }
              
            const result = await uploadToCloudinary(req.file, "/trip/coverPhoto", "image");
            trip.coverPhoto = {
              public_id: result.public_id,
              url: result.secure_url,
            };

        }
        await trip.save()

        res.status(200).json({ message: "Trip updated successfully", tripId });

       



    } catch (error) {
        return res.status(500).send({message:"Internal Server error"})
    }
}
export default editTrip