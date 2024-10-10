import { models, model, Schema } from "mongoose";
import { IUser, UserRoles } from "../types/types";
import bcrypt from "bcryptjs";
import crypto from "crypto";
import { default_avatar } from "../constants/Images";
import validator from "validator";

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      validate: {
        validator: function (value: string) {
          return validator.isEmail(value);
        },
        message: `Invalid email address.`,
      },
    },
    password: {
      type: String,
      required: true,
      select: false,
      min: [8, "Password is too long"],
      max: [50, "Password is too short."],
    },
    photo: {
      type: String,
      default: default_avatar,
    },
    role: {
      type: String,
      enum: UserRoles,
      default: UserRoles.USER,
    },
    isVerified: { type: Boolean, select: false, default: false },
    isDeleted: { type: Boolean, select: false, default: false },
    shipments: [{ type: Schema.Types.ObjectId, ref: "Shipment" }],
    trips: [{ type: Schema.Types.ObjectId, ref: "Trip" }],
    earnings: { type: Number, default: 0 },
    reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }],
    averageRating: {
      type: Number,
      min: [0, "Rating must be between 0 and 5"],
      max: [5, "Rating must be between 0 and 5"],
      default: 0,
    },
    verificationCode: String,
    verificationCodeExpires: Date,
    passwordResetToken: String,
    passwordResetExpires: Date,

    passwordChangedAt: Date,
  },
  { timestamps: true }
);

// Handle detect users
userSchema.pre(/^find/, function (this: any, next) {
  this.where({ isDeleted: { $ne: true } });
  next();
});

// calculate average rating
userSchema.pre("save", function (next) {
  const totalReviews = this.reviews.length;

  if (totalReviews === 0) {
    this.averageRating = 0;
    return next();
  }

  let totalRating = this.reviews.reduce((acc, item) => acc + item.rating, 0);
  this.averageRating = Math.floor(totalRating / totalReviews);
  next();
});

// encrypt password before saving
userSchema.pre<IUser>("save", async function (next) {
  if (!this.isModified("password")) {
    return next();
  }

  this.password = await bcrypt.hash(this.password, 12);
  next();
});

userSchema.pre("save", function (next) {
  if (!this.isModified("password") || this.isNew) return next();

  this.passwordChangedAt = new Date(Date.now() - 1000);
  next();
});

// compare password method
userSchema.methods.comparePassword = async function (
  candidatePassword: string
): Promise<boolean> {
  return await bcrypt.compare(candidatePassword, this.password);
};

// reset password token
userSchema.methods.getPasswordResetToken = function (): string {
  const resetToken = crypto.randomBytes(16).toString("hex");

  // Hash token and set to passwordResetToken field
  this.passwordResetToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes.

  return resetToken;
};

//
userSchema.methods.changedPasswordAfter = function (
  JWTTimestamp: number
): boolean {
  if (this.passwordChangedAt) {
    const changedTimestamp = this.passwordChangedAt.getTime() / 1000;

    return JWTTimestamp < changedTimestamp;
  }

  return false;
};

// generate verification code
userSchema.methods.generateVerificationCode = function (): string {
  // Generate verification code (4-digits number)
  const verificationCode = crypto.randomInt(1000, 9999).toString();

  // set code expiration time (30-minutes)
  const verificationCodeExpires = new Date(Date.now() + 30 * 60 * 1000);

  this.verificationCode = verificationCode;
  this.verificationCodeExpires = verificationCodeExpires;

  return verificationCode;
};

// Indexes
userSchema.index({ email: 1 });

const User = models.User || model<IUser>("User", userSchema);

export default User;
