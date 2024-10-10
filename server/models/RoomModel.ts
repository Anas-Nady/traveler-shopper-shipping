import { model, models, Schema } from "mongoose";
import { IRoom } from "../types/types";

const roomSchema = new Schema<IRoom>({
  name: {
    type: String,
    required: true,
    unique: true,
  },
  members: [{ type: Schema.Types.ObjectId, ref: "User" }],
  shipment: { type: Schema.Types.ObjectId, ref: "Shipment" },
  createdAt: { type: Date, default: Date.now },
});

const Room = models.Room || model<IRoom>("Room", roomSchema);

export default Room;
