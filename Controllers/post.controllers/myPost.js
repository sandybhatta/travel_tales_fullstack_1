import Post from "../../models/post.js";

const myPost = async (req,res)=>{

    try {
        const { user } = req;
        const post = await Post.find({
            author:user._id
        }).populate([
            {
                path:"author",
                select:"name username avatar",
            },
            {
                path:"taggedUsers",
                select:"name username avatar"
            },
            {
                path:"likes",
                select:"_id",
            },
            {
                path:"comments",
                options:{limit:2},
                populate:{path:"author" , select:"name username avatar"}
            }
        ])
            .sort({createdAt:-1})

        if(post.length === 0){
            return res.status(200).json({message:"No posts made so far"})
        }
        return res.status(200).json({post})
    } catch (error) {
        return res.status(500).json({message:"Internal Server Error"})
    }
}
export default myPost