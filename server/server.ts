import app from "./app";
import connectDB from "./utils/db";
import dotenv from "dotenv";

dotenv.config({ path: "./../.env" });

// Handle un caught Exception.
process.on("uncaughtException", (err: Error) => {
  const { name, message } = err;
  console.error(`UnCaughtException error: ${name}, ${message}`);
  process.exit(1);
});

// connect to database
connectDB();

// listening on port
const PORT = process.env.PORT;
const SERVER = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});

// Handle un handled rejection
process.on("unhandledRejection", (err: Error) => {
  const { name, message } = err;
  console.error(`UnHandledRejection error: ${name}, ${message}`);
  SERVER.close(() => {
    process.exit(1);
  });
});
