import Trip from "../../models/trip.js";

const addExpensesTrip = async (req, res) => {
  try {
    const { title, amount, spentBy } = req.body;
    const { tripId } = req.params;
    const { user } = req;

    // 1. Validation
    if (!title || !amount) {
      return res
        .status(400)
        .json({ message: "Title and amount are both required." });
    }

    // 2. Trip existence
    const trip = await Trip.findById(tripId);
    if (!trip) {
      return res.status(404).json({ message: "Trip not found." });
    }

    // 3. Permission check
    const isOwner = trip.isOwnedBy(user._id);
    const isCollaborator = trip.isFriendAccepted(user._id);

    if (!isOwner && !isCollaborator) {
      return res
        .status(403)
        .json({ message: "Only trip owner or collaborator can add expenses." });
    }

    // 4. If `spentBy` is provided, ensure they're in the trip
    let spenderId = user._id; // default to current user

    if (spentBy) {
      const isValidSpender =
        trip.isOwnedBy(spentBy) || trip.isFriendAccepted(spentBy);

      if (!isValidSpender) {
        return res.status(403).json({
          message:
            "The user marked as spender must be the trip owner or a collaborator.",
        });
      }

      spenderId = spentBy;
    }

    // 5. Push the new expense to the array
    trip.expenses.push({
      title,
      amount,
      spentBy: spenderId,
    });

    await trip.save();

    return res.status(201).json({
      success: true,
      message: "Expense added to the trip successfully.",
      tripId: trip._id,
      expense: trip.expenses[trip.expenses.length - 1],
    });
  } catch (error) {
    console.error("Error in addExpensesTrip:", error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export default addExpensesTrip;
