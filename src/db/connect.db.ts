import "dotenv/config";
import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.CONNECTION_STR as string);
  } catch (error) {
    throw error;
  }
};

export { connectDB };
