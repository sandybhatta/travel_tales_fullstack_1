import Trip from "../../models/trip.js"; 

export const deleteExpense = async (req, res) => {
  try {
    const { tripId, expenseId } = req.params;
    const userId = req.user._id; 

    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ success: false, message: "Trip not found." });
    }

    
    const isAuthorized =
      trip.isOwnedBy(userId) || trip.isFriendAccepted(userId)

    if (!isAuthorized) {
      return res.status(403).json({ success: false, message: "Unauthorized to delete this expense." });
    }

    // Find the index of the expense
    const expenseIndex = trip.expenses.findIndex(
      (expense) => expense._id.toString() === expenseId
    );

    if (expenseIndex === -1) {
      return res.status(404).json({ success: false, message: "Expense not found." });
    }

    
    const expense = trip.expenses[expenseIndex];
    if (
      expense.spentBy &&
      expense.spentBy.toString() !== userId.toString() &&
      trip.user.toString() !== userId.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own expenses or if you're the trip owner.",
      });
    }

    // Remove the expense
    trip.expenses.splice(expenseIndex, 1);
    await trip.save();

    return res.status(200).json({
      success: true,
      message: "Expense deleted successfully.",
      tripId: trip._id,
      remainingExpenses: trip.expenses,
    });
  } catch (error) {
    console.error("Error deleting expense:", error);
    return res.status(500).json({
      success: false,
      message: "Server error. Could not delete expense.",
    });
  }
};

export default deleteExpense