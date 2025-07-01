



const updateProfile= async(req,res)=>{
    const {user}=req
    const {name , bio, avatar, city , state, country}=req.body

    try{
        // if other fields are updating through this api rather than the fields that are expected to modify only then throw error

        const allowedFields = ["name", "bio", "avatar", "city", "state", "country"];

        const invalidFields = Object.keys(req.body).filter(key => !allowedFields.includes(key));

        if (invalidFields.length) {
            return res.status(400).json({ message: `Invalid field(s): ${invalidFields.join(", ")}` });
        }





       if(name !== undefined){
        user.name=name
       }
       if(bio !== undefined){
        user.bio=bio
       }
       if(avatar !== undefined){
        user.avatar=avatar
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