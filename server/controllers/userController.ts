import catchAsync from "../middlewares/asyncHandler";
import User from "../models/userModel";
import AppError from "../utils/appError";

type AllowedFields = "name" | "password" | "photo";

// Protected
// GET: /api/users/get-all
export const getAllUsers = catchAsync(async (req, res, next) => {
  const users = await User.find({});

  res.status(200).json({
    status: "success",
    results: users.length,
    data: users,
  });
});

// Protected
// GET: /api/users/get-me
export const getMyAccount = catchAsync(async (req, res, next) => {
  if (!req.user) {
    return next(new AppError("You are not logged in", 401));
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  res.status(200).json({
    status: "success",
    user,
  });
});

// Protected
// PATCH: /api/users/update-me
export const updateMyAccount = catchAsync(async (req, res, next) => {
  if (!req.user) {
    return next(new AppError("You are not logged in", 401));
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  const allowedFields: AllowedFields[] = ["name", "password"];

  // Update user fields dynamically based on req.body
  allowedFields.forEach((field) => {
    if (req.body[field as AllowedFields] !== undefined) {
      user[field as AllowedFields] = req.body[field];
    }
  });

  if (req.file && req.file.path) {
    user.photo = req.file.path;
  }

  await user.save();

  res.status(200).json({
    status: "success",
    user,
  });
});

// Protected
// DELETE: /api/users/delete-me
export const deleteMyAccount = catchAsync(async (req, res, next) => {
  if (!req.user) {
    return next(new AppError("You are not logged in", 401));
  }

  const user = await User.findById(req.user._id);

  if (!user) {
    return next(new AppError("User not found", 404));
  }

  user.isDeleted = true; // sort delate
  await user.save();

  // set req.user to null & logout the user
  req.user = null;
  res.clearCookie("token");

  res.header("Authorization", "Bearer ").status(200).json({
    status: "success",
    message: "User account deleted successfully",
  });
});
