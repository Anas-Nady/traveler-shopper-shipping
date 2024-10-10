import { Response } from "express";
import jwt from "jsonwebtoken";
import { IUser } from "../types/types";
import { CookieOptions } from "express";

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY as string;
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN as string;

export const generateToken = (user: IUser) => {
  return jwt.sign({ id: user._id }, JWT_SECRET_KEY, {
    expiresIn: JWT_EXPIRES_IN,
  });
};

export const sendTokenResponse = (
  user: IUser,
  statusCode: number,
  res: Response
): string => {
  const token = generateToken(user);

  const JWT_COOKIE_EXPIRES = Number(process.env.JWT_COOKIE_EXPIRES);

  const cookieOptions: CookieOptions = {
    httpOnly: true,
    expires: new Date(Date.now() + JWT_COOKIE_EXPIRES * 24 * 60 * 60 * 1000), // in seconds
    secure: process.env.NODE_ENV === "PRODUCTION",
  };

  res
    .header("Authorization", `Bearer ${token}`)
    .cookie("token", token, cookieOptions)
    .status(statusCode)
    .json({
      status: "success",
      token,
      user,
    });

  return token;
};
