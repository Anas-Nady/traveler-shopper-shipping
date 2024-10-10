import { default_avatar } from "../constants/Images";
import { sendVerificationEmail } from "../helpers/sendVerificationEmail";
import catchAsync from "../middlewares/asyncHandler";
import User from "../models/userModel";
import { resetPasswordTemplate } from "../templates/resetPassword";
import AppError from "../utils/appError";
import { sendEmail } from "../utils/email";
import { sendTokenResponse } from "../utils/token";
import crypto from "crypto";

// register
export const register = catchAsync(async (req, res, next) => {
  const { name, email, password, role } = req.body;

  let photoURL: string = default_avatar;
  if (req.file) {
    photoURL = req.file.path;
  }

  const user = await User.create({
    name,
    email,
    password,
    role,
    photo: photoURL,
  });

  if (!user) {
    return next(new AppError("Invalid data input", 400));
  }

  try {
    await sendVerificationEmail(user);

    res.status(201).json({
      status: "success",
      message: "User registered. Verification email sent to your email.",
    });
  } catch (error) {
    await User.findByIdAndDelete(user._id);
    return next(
      new AppError("There was an error sending the email. try again later", 500)
    );
  }
});

// verify email
export const verifyEmail = catchAsync(async (req, res, next) => {
  const { email, code } = req.body;

  if (!email || !code) {
    return next(new AppError("Invalid verification request.", 400));
  }

  const user = await User.findOne({
    email: email as string,
    verificationCode: code as string,
    verificationCodeExpires: { $gt: new Date() },
  }).select("+isVerified");

  if (!user) {
    return next(new AppError("Invalid or expired verification code.", 400));
  }

  if (user.isVerified) {
    return next(new AppError("Your email already verified before.", 400));
  }

  user.isVerified = true;
  user.verificationCode = undefined;
  user.verificationCodeExpires = undefined;
  await user.save();

  sendTokenResponse(user, 201, res);
});

// login
export const login = catchAsync(async (req, res, next) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select("+password +isVerified");

  if (!user || !(await user.comparePassword(password))) {
    return next(new AppError("Invalid email or password", 401));
  }

  if (user.isVerified === false) {
    try {
      await sendVerificationEmail(user);

      res.status(201).json({
        status: "success",
        message:
          "You need to verify your email first. Verification email sent to your email.",
      });
    } catch (error) {
      await User.findByIdAndDelete(user._id);
      return next(
        new AppError(
          "There was an error sending the email. try again later",
          500
        )
      );
    }
  }

  sendTokenResponse(user, 200, res);
});

// forgot password
export const forgotPassword = catchAsync(async (req, res, next) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  if (!user) {
    return next(new AppError("There is no user with that email address.", 404));
  }

  const resetToken = user.getPasswordResetToken();
  await user.save({ validateBeforeSave: false });

  const resetPasswordURL = `${req.protocol}://${req.get("host")}/api/auth/reset-password/${resetToken}`;

  const emailOptions = {
    to: email,
    subject: "Reset Password",
    html: resetPasswordTemplate(resetPasswordURL),
  };

  try {
    await sendEmail(emailOptions);

    res.status(200).json({
      status: "success",
      message: "Reset password link sent to your email",
    });
  } catch (error) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError(
        "There was an error sending the email. Try again later.",
        500
      )
    );
  }
});

// reset password
export const resetPassword = catchAsync(async (req, res, next) => {
  const resetToken = req.params.resetToken;

  // Hash the reset token before querying
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");

  const user = await User.findOne({
    passwordResetToken: hashedToken,
    passwordResetExpires: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError("Invalid token or has been expired.", 400));
  }

  // set the new password.
  user.password = req.body.password;
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;

  await user.save();

  // send token to response
  sendTokenResponse(user, 200, res);
});

// logout
export const logout = catchAsync(async (req: any, res, next) => {
  // set req.user to null
  req.user = null;

  // remove token from cookie & header
  res
    .header("Authorization", "Bearer ")
    .cookie("token", "", { expires: new Date(Date.now()), httpOnly: true })
    .status(200)
    .json({ status: "success", message: "Logged out" });
});
