import Trip from "../../models/trip.js";

const deleteTodo = async(req,res)=>{
    try {
        const { tripId , todoId } = req.params;
        const { user } = req;
        const trip = await Trip.findById(tripId);
        if(!trip){
            return res.status(404).json({message:"No trip found"})
        }
        const isOwner = trip.isOwnedBy(user._id);
        const isCollaborator = trip.isFriendAccepted(user._id);
        if(!isOwner && !isCollaborator){
            return res.status(403).json({message:"Unauthorized to delete todo"})
        }
        const todo = trip.todoList.find(todo=>todo._id.toString() === todoId)

        if(!todo){
            return res.status(404).json({message:"No todo found"})
        }

        trip.todoList = trip.todoList.filter(todo=>todo._id.toString() !== todoId)

        await trip.save();
        return res.status(200).json({
            success:true,
            todo:trip.todoList
        })

    } catch (error) {
        return res.status(500).json({
            message: "Internal Server Error",
            error: error.message,
          });
    }
}
export default deleteTodo