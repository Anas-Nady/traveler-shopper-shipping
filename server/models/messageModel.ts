import { model, models, Schema } from "mongoose";
import { IMessage } from "../types/types";

const messageSchema = new Schema<IMessage>({
  room: {
    type: Schema.Types.ObjectId,
    required: true,
    ref: "Room",
  },
  from: { type: Schema.Types.ObjectId, ref: "User", required: true },
  to: { type: Schema.Types.ObjectId, ref: "User", required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const Message = models.Message || model<IMessage>("Message", messageSchema);

export default Message;
