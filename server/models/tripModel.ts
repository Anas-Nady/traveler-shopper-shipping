import { model, models, Schema } from "mongoose";
import { ITrip, TripStatus } from "../types/types";
import AppError from "../utils/appError";
import { CountryEnum } from "../constants/Countries";

const tripSchema = new Schema<ITrip>(
  {
    from: { type: String, enum: CountryEnum, required: true },
    to: { type: String, enum: CountryEnum, required: true },
    departureDate: { type: Date, required: true },
    availableSpace: {
      type: Number,
      required: true,
      min: [0, "Available space must be at least 0"],
      max: [100, "Available space must be at most 100"],
    },
    consumedSpace: {
      type: Number,
      required: true,
      default: 0,
      min: [0, "Consumed space must be at least 0"],
      max: [100, "Consumed space must be at most 100"],
    },
    status: [
      {
        type: String,
        enum: TripStatus,
        default: TripStatus.UNDER_REVIEW,
      },
    ],
    traveler: { type: Schema.Types.ObjectId, ref: "User", required: true },
    shoppers: [{ type: Schema.Types.ObjectId, ref: "User" }],
    shipments: [{ type: Schema.Types.ObjectId, ref: "Shipment" }],
    reviews: [{ type: Schema.Types.ObjectId, ref: "Review" }],
  },
  { timestamps: true }
);

tripSchema.pre("save", function (next) {
  if (this.departureDate <= new Date()) {
    return next(new AppError("The departure date cannot be in the past.", 400));
  }
  next();
});

tripSchema.pre("save", function (next) {
  if (this.consumedSpace > this.availableSpace) {
    return next(
      new AppError(
        "The consumed space cannot be greater than available space",
        400
      )
    );
  }
  next();
});

tripSchema.pre("save", function (next) {
  if (this.to === this.from) {
    return next(new AppError("From and To addresses cannot be the same", 400));
  }
  next();
});

const Trip = models.Trip || model<ITrip>("Trip", tripSchema);

export default Trip;
