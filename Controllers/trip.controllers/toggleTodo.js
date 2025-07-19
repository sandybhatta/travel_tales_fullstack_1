import Trip from "../../models/trip.js";

const toggleTodo = async (req, res) => {
  try {
    const { tripId, todoId } = req.params;
    const { user } = req;

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ message: "No trip found" });
    }

    const isOwner = trip.isOwnedBy(user._id);
    const isCollaborator = trip.isFriendAccepted(user._id);

    if (!isOwner && !isCollaborator) {
      return res.status(403).json({ message: "Unauthorized, only owner and collaborator have permission" });
    }

    // Optional: Block after finalization
    if (trip.isFinalized) {
      return res.status(403).json({ message: "Trip is finalized. Todo list is locked." });
    }

    const todo = trip.todoList.find(todo => todo._id.toString() === todoId);
    if (!todo) {
      return res.status(404).json({ message: "No todo found" });
    }

    todo.done = !todo.done;
    await trip.save();

    return res.status(200).json({
      success: true,
      message: "Todo toggled successfully",
      
    });

  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export default toggleTodo;
