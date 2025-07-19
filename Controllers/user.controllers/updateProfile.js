import { uploadToCloudinary } from "../../utils/cloudinary";




const updateProfile= async(req,res)=>{
    const {user}=req
    const {name , bio, avatar, city , state, country , interests}=req.body

    try{
        // if other fields are updating through this api rather than the fields that are expected to modify only then throw error

        const allowedFields = ["name", "bio", "avatar", "city", "state", "country" , "interests"];

        const invalidFields = Object.keys(req.body).filter(key => !allowedFields.includes(key));

        if (invalidFields.length) {
            return res.status(400).json({ message: `Invalid field(s): ${invalidFields.join(", ")}` });
        }



        if(interests !== undefined){
          if(!Array.isArray(interests)){
            return res.status(400).send({message:"interests should be an array"})
          }
        }

        const allowedInterests=[
          "adventure",
          "beach",
          "mountains",
          "history",
          "food",
          "wildlife",
          "culture",
          "luxury",
          "budget",
          "road_trip",
          "solo",
          "group",
          "trekking",
          "spiritual",
          "nature",
          "photography",
          "festivals",
          "architecture",
          "offbeat",
          "shopping",
        ]


        const isValid=interests.every(interest=>allowedInterests.includes(interest))
        if(!isValid){
          return res.status(400).send({message:"interest is not valid"})
        }

        user.interests=interests

       if(name !== undefined){
        user.name=name
       }
       if(bio !== undefined){
        user.bio=bio
       }
       if (req.file && req.file.mimetype.startsWith("image/")) {
        const result = await uploadToCloudinary(req.file, "/post/avatar", "image");
        user.avatar = {
          public_id: result.public_id,
          url: result.secure_url,
        };
      }

       // if any of the location key exists then only change the location object if none of them are passed then no need to change it to the same location as it was

       if(city || state || country){
        user.location.city=city || user.location.city
        user.location.state=state || user.location.state
        user.location.country=country || user.location.country
       }
       
       await user.save();

       res.status(200).json({
         message: "Profile updated successfully",
             user: {
                name: user.name,
                bio: user.bio,
                avatar: user.avatar,
                location: user.location,
            }
       });
    } 
     
     catch (err) {
       console.error("Update error:", err);
       res.status(500).json({ message: "Something went wrong" });
     }

}


export default updateProfile