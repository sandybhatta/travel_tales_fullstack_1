import Trip from "../../models/trip.js";

const getTodo = async(req,res)=>{

    try {
        const { tripId } = req.params;
        const { user } = req;

        const trip = await Trip.findById(tripId).select("todoList").populate([
            {
                path:"todoList.createdBy",
                select:"name username avatar"
            },
            {
                path:"todoList.assignedTo",
                select:"name username avatar"
            }
        ])
        if (!trip) {
            return res.status(404).json({message:"No trip found"})
        }

        const isOwner = trip.isOwnedBy(user._id);
        const isCollaborator = trip.isFriendAccepted(user._id);

        if (!isOwner && !isCollaborator) {
           return res.status(403).json({message:"Only owner and collaborator can get to see the todo of this trip"}) 
        }

        const todoList = trip.todoList.sort((a, b) => {
            if (a.dueDate && b.dueDate) {
              return new Date(a.dueDate) - new Date(b.dueDate);
            } else if (!a.dueDate && b.dueDate) {
              return 1;
            } else if (a.dueDate && !b.dueDate) {
              return -1;
            } else {
              return 0;
            }
          });

        return res.status(200).json({
            success:true,
            todoList
        })

    } catch (error) {
        return res.status(500).json({
            message: "Internal Server Error",
            error: error.message,
          });
    }
}
export default getTodo