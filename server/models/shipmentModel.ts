import { model, models, Schema } from "mongoose";
import { IShipment, ShipmentStatus } from "../types/types";
import validator from "validator";
import { CategoryEnum } from "../constants/Categories";
import { CountryEnum } from "../constants/Countries";
import AppError from "../utils/appError";

const shipmentSchema = new Schema<IShipment>(
  {
    shopper: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    products: [
      {
        name: {
          type: String,
          required: true,
          maxlength: [50, "Product name too long"],
        },
        quantity: {
          type: Number,
          required: true,
          min: [1, "Quantity must be at least 1"],
          max: [10, "Quantity must be at most 10"],
        },
        category: { type: String, enum: CategoryEnum, required: true },
        link: {
          type: String,
          required: true,
          validate: {
            validator: function (url: string) {
              return validator.isURL(url);
            },
            message: `Invalid URL format for purchase link.`,
          },
        },
        price: {
          type: Number,
          required: true,
        },
        weight: {
          type: Number,
          required: true,
        },
        photo: {
          type: String,
          required: true,
          validate: {
            validator: function (path: string) {
              return validator.isURL(path);
            },
            message: `Invalid URL format for product photo.`,
          },
        },
      },
    ],
    from: { type: String, enum: CountryEnum, required: true },
    to: { type: String, enum: CountryEnum, required: true },
    status: [
      {
        type: String,
        enum: ShipmentStatus,
      },
    ],
    desiredDeliveryDate: { type: Date, required: true },
    rewardPrice: { type: Number, required: true }, // in USD
    trip: { type: Schema.Types.ObjectId, ref: "Trip" },
    traveler: { type: Schema.Types.ObjectId, ref: "User" },
    review: { type: Schema.Types.ObjectId, ref: "Review" },
    fees: { type: Number, required: true },
  },
  { timestamps: true }
);

shipmentSchema.pre("save", function (next) {
  this.fees = this.rewardPrice * 0.2; // 20% of rewardPrice
  next();
});

shipmentSchema.pre("save", function (next) {
  const totalPrices = this.products.reduce((acc, item) => acc + item.price, 0);

  if (totalPrices > 1000) {
    return next(
      new AppError("Products prices must be greater than 1000$", 400)
    );
  }
  next();
});

shipmentSchema.pre("save", function (next) {
  if (this.desiredDeliveryDate <= new Date()) {
    return next(new AppError("The delivery date cannot be in the past.", 400));
  }
  next();
});

shipmentSchema.pre("save", function (next) {
  if (this.to === this.from) {
    return next(new AppError("From and To addresses cannot be the same", 400));
  }
  next();
});

const Shipment =
  models.Shipment || model<IShipment>("Shipment", shipmentSchema);

export default Shipment;
