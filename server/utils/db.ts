import mongoose from "mongoose";

const connectDB = async (): Promise<void> => {
  const MONGODB_URL = process.env.MONGODB_URL as string;
  if (!MONGODB_URL) {
    console.error(`MongoDB connection URL is missing in .env file.`);
    process.exit(1);
  }

  try {
    await mongoose.connect(MONGODB_URL);
    console.log("MongoDB connected");
  } catch (error) {
    console.error(`MongoDB connection error: ${error}`);
    process.exit(1);
  }
};

export default connectDB;
