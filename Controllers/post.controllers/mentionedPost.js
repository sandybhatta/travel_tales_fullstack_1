import Post from "../../models/post.js";

const mentionedPost = async(req,res)=>{

    try {
        const { user } = req;
        const post = await Post.find({
            mentions:user._id
        }).populate("author" , "name username avatar").sort({createdAt:-1})

        if(post.length === 0){
            return res.status(200).json({message:"No posts have been found where you were mentioned"})
        }
        return res.status(200).json({post})
    } catch (error) {
        return res.status(500).json({message:"Internal Server Error"})
    }
}
export default mentionedPost