import Trip from "../../models/trip.js";

const getExpensesTrip = async (req, res) => {
  try {
    const { user } = req;
    const { tripId } = req.params;

    const trip = await Trip.findById(tripId)
      .select("expenses")
      .populate("expenses.spentBy", "name username avatar");

    if (!trip) {
      return res.status(404).json({ message: "No trip found" });
    }

    const isOwner = trip.isOwnedBy(user._id);
    const isCollaborator = trip.isFriendAccepted(user._id);

    if (!isOwner && !isCollaborator) {
      return res.status(403).json({
        message: "Only Owner and Collaborators can view expenses",
      });
    }

    const totalExpenses = trip.expenses.reduce((acc, curr) => {
      return acc + (curr.amount || 0);
    }, 0);

    return res.status(200).json({
      success: true,
      expenses: trip.expenses,
      totalExpenses,
    });
  } catch (error) {
    console.error("getExpensesTrip error:", error);
    return res
      .status(500)
      .json({ message: "Internal Server Error", error: error.message });
  }
};

export default getExpensesTrip;
