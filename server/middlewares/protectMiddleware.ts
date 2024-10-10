import jwt from "jsonwebtoken";
import AppError from "../utils/appError";
import catchAsync from "./asyncHandler";
import User from "../models/userModel";

interface DecodedToken {
  id: string;
  iat: number;
}

export const authenticateUser = catchAsync(
  async (req: any, res: any, next: any) => {
    let token: string | undefined;

    if (req.cookie && req.cookie.token) {
      token = req.cookie.token;
    } else if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(new AppError("You are not logged in", 401));
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET_KEY as string
    ) as DecodedToken;

    // check if user exists.
    const user = await User.findById(decoded?.id);
    if (!user) {
      return next(
        new AppError("The user belonging to this token no longer exists.", 404)
      );
    }

    // check if user changed password after the token was issued.
    if (user.changedPasswordAfter(decoded.iat)) {
      return next(
        new AppError("User recently changed password. Please login again", 401)
      );
    }

    console.log(user);
    req.user = user;
    next();
  }
);

export const authorizeRoles = (allowedRoles: string[]) =>
  catchAsync(async (req: any, res, next) => {
    if (!allowedRoles.includes(req.user?.role)) {
      return next(
        new AppError("You don't have permission to perform this action", 403)
      );
    }
    next();
  });
