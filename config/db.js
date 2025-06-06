
import mongoose from "mongoose";
import dotenv from "dotenv";
dotenv.config();

export async function connectDb() {
  try {
    const conn = await mongoose.connect(process.env.MONGO_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`✅ MongoDB Connected: ${conn.connection.host}`);
  } catch (err) {
    console.error("❌ MongoDB Connection Error:", err.message);
    process.exit(1); // Exit process with failure
  }
}


// 🛑 2. Why process.exit(1) in catch block?


// process.exit(1);
// This immediately stops the server if the database connection fails.

// 1 means “exit with failure.”

// 0 would mean “exit successfully.”

// 💡 Why do this?
// Because if your app fails to connect to MongoDB, it should NOT keep running.
// You don’t want routes trying to query a DB that’s not even connected — it leads to confusing bugs.

// So we fail fast, clearly and loudly.