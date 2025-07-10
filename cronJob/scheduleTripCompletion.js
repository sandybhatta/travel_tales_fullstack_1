import cron from "node-cron";
import Trip from "../models/trip";

export const scheduleTripCompletion = () => {
  cron.schedule("0 1 * * *", async () => {
    try {
      const now = new Date();
      const result = await Trip.updateMany(
        { endDate: { $lt: now }, isCompleted: false },
        { $set: { isCompleted: true } }
      );

      console.log(
        `[CRON] ✅ Trip auto-completion ran. Modified ${result.modifiedCount} trips.`
      );
    } catch (error) {
      console.error("[CRON] ❌ Error updating trips:", error.message);
    }
  });
};
