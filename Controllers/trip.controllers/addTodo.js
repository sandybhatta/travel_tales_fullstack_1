import Trip from "../../models/trip.js";
import User from "../../models/User.js";

const addTodo = async (req, res) => {
  try {
    const { task, dueDate, assignedTo } = req.body;
    const { tripId } = req.params;
    const { user } = req;

    if (!task || !task.trim()) {
      return res.status(400).json({ message: "Task is required and cannot be empty." });
    }

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ message: "No trip found" });
    }

    if (trip.isCompleted || trip.isArchived) {
      return res.status(403).json({ message: "Cannot add more tasks." });
    }

    const isOwner = trip.isOwnedBy(user._id);
    const isCollaborator = trip.isFriendAccepted(user._id);

    if (!isOwner && !isCollaborator) {
      return res.status(403).json({ message: "Only owner and collaborators can add tasks." });
    }

    if (assignedTo) {
      const assignedUser = await User.findById(assignedTo);
      if (!assignedUser) {
        return res.status(400).json({ message: "Assigned user does not exist." });
      }
      if (!trip.isFriendAccepted(assignedTo)) {
        return res.status(400).json({ message: "Assigned user must be an accepted collaborator." });
      }
    }

    const todoItem = {
      task: task.trim(),
      dueDate: dueDate ? new Date(dueDate) : undefined,
      createdBy: user._id,
      assignedTo: assignedTo ? assignedTo : undefined,
    };

    trip.todoList.push(todoItem);
    await trip.save();

    const newTodo = trip.todoList[trip.todoList.length - 1];

    return res.status(200).json({
      message: "Todo added successfully.",
      todo: newTodo,
    });
  } catch (error) {
    return res.status(500).json({
      message: "Internal Server Error",
      error: error.message,
    });
  }
};

export default addTodo;
