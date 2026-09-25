import "dotenv/config";
import mongoose from "mongoose";

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.CONNECTION_STR as string, {
      maxPoolSize: 100,
      minPoolSize: 20,
      maxIdleTimeMS: 30000,
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 0,
      waitQueueTimeoutMS: 10000,
      retryWrites: true,
      retryReads: true,
    });
  } catch (error) {
    console.error("Mongodb connection failed: ", error)
    process.exit(1)
  }
};

mongoose.connection.on("error", err=> {
  console.error("Mongodb connection error: ", err)
});

process.on("SIGINT", async ()=>{
  try {
    await mongoose.connection.close();
    console.log("Mongodb connection colsed")
  } catch (error) {
    console.error("Error during shutdown!");
    process.exit(1)
  }
});

export { connectDB };
