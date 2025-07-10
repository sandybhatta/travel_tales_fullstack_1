import Trip from "../../models/trip.js";
import User from "../../models/User.js";
import { uploadToCloudinary } from "../../utils/cloudinary.js";

const createTrip = async (req, res) => {
  const { user } = req;

  // 1. Check for banned or deactivated users
  if (user.isBanned) {
    return res.status(403).json({ message: "This account has been banned from TravelTales" });
  }
  if (user.isDeactivated) {
    return res.status(403).json({ message: "The account is deactivated" });
  }

  try {
    const {
      title,
      description,
      startDate,
      endDate,
      tags,
      visibility,
      destinations,
      travelBudget,
      expenses,
      notes,
      todoList,
      invitedFriends,
    } = req.body;

    const tripBody = {
      user: user._id,
      isArchived: false,
      isCompleted: false,
      totalLikes: 0,
      totalComments: 0
    };

    // 2. Validate required fields
    if (!title || !startDate || !endDate) {
      return res.status(400).json({
        message: "Please provide title, startDate, and endDate. These are mandatory."
      });
    }

    if (new Date(startDate) > new Date(endDate)) {
      return res.status(400).json({ message: "Start date cannot be after end date." });
    }

    tripBody.title = title;
    tripBody.startDate = startDate;
    tripBody.endDate = endDate;

    if (description) tripBody.description = description;

    // 3. Handle coverPhoto upload
    if (req.file && req.file.mimetype.startsWith("image/")) {
      const result = await uploadToCloudinary(req.file, "/trip/coverPhoto", "image");
      tripBody.coverPhoto = {
        public_id: result.public_id,
        url: result.secure_url,
      };
    }

    // 4. Validate and assign invited friends
    let validInvitedFriends = [];
    if (Array.isArray(invitedFriends)) {
      const existingUsers = await User.find({ _id: { $in: invitedFriends } }).select("_id");
      validInvitedFriends = existingUsers
        .map(u => u._id.toString())
        .filter(id => id !== user._id.toString());
      validInvitedFriends = [...new Set(validInvitedFriends)];
    }
    if (validInvitedFriends.length) {
      tripBody.invitedFriends = validInvitedFriends;
    }

    // 5. Validate tags
    if (tags && tags.length > 0) {
      const allowedTags = new Set([
        "adventure", "beach", "mountain", "city", "honeymoon", "family",
        "solo", "friends", "luxury", "budget", "wildlife", "roadtrip", "spiritual"
      ]);
      for (const tag of tags) {
        if (!allowedTags.has(tag)) {
          return res.status(400).json({ message: "Invalid tag detected." });
        }
      }
      tripBody.tags = tags;
    }

    // 6. Validate visibility
    const allowedVisibility = ["public", "followers", "close_friends", "private"];
    if (visibility && allowedVisibility.includes(visibility)) {
      tripBody.visibility = visibility;
    }

    // 7. Travel budget
    if(travelBudget){

          
      const parsedBudget = parseInt(travelBudget);
      if (isNaN(parsedBudget) || parsedBudget < 0){
          return res.status(400).json({message:"travel budget should be grater than or equal to 0"})
       }
       tripBody.travelBudget=travelBudget

  }

    // 8. Destinations
    if (Array.isArray(destinations) && destinations.length > 0) {
      tripBody.destinations = destinations;
    }

    // 9. Expenses validation
    if (expenses && expenses.length > 0) {
      for (const expense of expenses) {
        if (!expense.title) return res.status(400).json({ message: "Each expense must have a title." });
        if (expense.amount < 0) return res.status(400).json({ message: "Expense amount must be >= 0." });
        const validUser = await User.findById(expense.spentBy).select("_id");
        if (!validUser) return res.status(404).json({ message: "Invalid 'spentBy' user." });
      }
      tripBody.expenses = expenses;
    }

    // 10. Notes validation
    if (notes && notes.length > 0) {
      for (const note of notes) {
        if (!note.body) return res.status(400).json({ message: "Each note must have a body." });
        const validUser = await User.findById(note.createdBy).select("_id");
        if (!validUser) return res.status(404).json({ message: "Invalid 'createdBy' in notes." });
      }
      tripBody.notes = notes;
    }

    // 11. Todo list validation
    if (todoList && todoList.length > 0) {
      for (const todo of todoList) {
        if (!todo.task) return res.status(400).json({ message: "Each todo must have a task." });
        const createdByUser = await User.findById(todo.createdBy).select("_id");
        const assignedToUser = await User.findById(todo.assignedTo).select("_id");
        if (!createdByUser || !assignedToUser) {
          return res.status(404).json({ message: "Invalid 'createdBy' or 'assignedTo' in todo." });
        }
      }
      tripBody.todoList = todoList;
    }

    // 12. Create and save trip
    const newTrip = new Trip(tripBody);
    await newTrip.save();

    return res.status(201).json({ message: "Trip created successfully", trip: newTrip.toJSON() });
  } catch (error) {
    console.error("Error in creating trip:", error);
    return res.status(500).json({ message: "Something went wrong", error: error.message });
  }
};

export default createTrip;