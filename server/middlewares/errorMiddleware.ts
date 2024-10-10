import { Request, Response, NextFunction } from "express";
import AppError from "../utils/appError";

const errorHandler = (
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  let error = { ...err };
  error.message = err.message;

  console.error(error);

  // Handle Mongoose ValidationError
  if (err.name === "ValidationError") {
    const messages = Object.values(err.errors).map((val: any) => val.message);
    error = new AppError(`Validation Error: ${messages.join(", ")}`, 400);
  }

  // Mongoose bad ObjectId
  if (err.name === "CastError") {
    const message = `Resource is not found with id of '${err.name}'`;
    error = new AppError(message, 404);
  }

  // Mongoose duplicate key
  if (err.code === 11000) {
    const message = Object.values(err.keyValue).join(", ");
    error = new AppError(`Duplicate field value: ${message}`, 400);
  }

  // Multer file upload error
  if (err.name === "MulterError") {
    const message = err.message || "Multer error";
    error = new AppError(message, 400);
  }

  const statusCode = error.statusCode || 500;
  const message = error.message || "Internal Server Error";

  res.status(statusCode).json({
    status: error.status,
    message,
  });
};

export default errorHandler;
