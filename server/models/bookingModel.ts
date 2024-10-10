import { model, models, Schema } from "mongoose";
import { IBooking, BookingMethods } from "../types/types";

const bookingSchema = new Schema<IBooking>({
  shipment: {
    type: Schema.Types.ObjectId,
    ref: "Shipment",
    required: [true, "Booking must belong to a shipment"],
  },
  user: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Booking must belong to a user"],
  },
  price: { type: Number, required: true },
  bookingMethod: { type: String, enum: BookingMethods, required: true },
  createdAt: {
    type: Date,
    default: Date.now(),
  },
  paid: { type: Boolean, default: true },
});

const Booking = models.Booking || model<IBooking>("Booking", bookingSchema);

export default Booking;
