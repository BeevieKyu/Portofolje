
import mongoose from "mongoose";

const connectDB = async () => {
  try {
    const mongoUri =
      process.env.MONGO_URI || "mongodb://localhost:27017/spanish_poker";

    const conn = await mongoose.connect(mongoUri);

    console.log(`MongoDB connected: ${conn.connection.host}`);
    return conn;
  } catch (error) {
    console.error(`MongoDB connection failed :(: ${error.message}`);
    process.exit(1);
  }
};


mongoose.connection.on("disconnected", () => {
  console.warn("MongoDB disconnected o7");
});

mongoose.connection.on("error", (error) => {
  console.error("MongoDB error:", error.message);
});

export default connectDB;
