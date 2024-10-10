import express, { Application } from "express";
import cors from "cors";
import errorHandler from "./middlewares/errorMiddleware";
import cookieParser from "cookie-parser";
import morgan from "morgan";
import authRoutes from "./routes/authRouter";
import usersRoutes from "./routes/userRouter";
import shopperRoutes from "./routes/shopperRouter";
import travelerRoutes from "./routes/travelerRouter";
import tripsRoutes from "./routes/tripRouter";
import http from "http";
import { Server } from "socket.io";
import Room from "./models/RoomModel";

const app: Application = express();
const httpServer = http.createServer(app);
const io = new Server(httpServer);

// log requests
if (process.env.NODE_ENV === "PRODUCTION") {
  app.use(morgan("combined"));
} else if (process.env.NODE_ENV === "DEVELOPMENT") {
  app.use(morgan("dev"));
}

// MIDDLEWARE
app.use(express.json());
app.use(cookieParser());

app.use(cors());

// API ROUTES
app.use("/api/auth", authRoutes);
app.use("/api/users", usersRoutes);
app.use("/api/shopper", shopperRoutes);
app.use("/api/traveler", travelerRoutes);
app.use("/api/trips", tripsRoutes);

// Socket.IO
io.on("connection", (socket) => {
  console.log(`Socket ${socket.id} connected.`);

  // Join room
  socket.on("join_room", async (payload) => {
    const { shipmentId, shopperId, travelerId, shipmentName } = payload;

    socket.join(shipmentId);

    let room = await Room.findOne({ shipment: shipmentId });

    if (!room) {
      room = await Room.create({
        name: `Chat about ${shipmentName}`,
        shipment: shipmentId,
        members: [shopperId, travelerId],
        createdAt: new Date(),
      });
    } else {
      const updatedMembers = new Set(room.members);
      updatedMembers.add(shopperId);
      updatedMembers.add(travelerId);

      room.members = Array.from(updatedMembers);
      await room.save();
    }

    socket.emit("receive_message", { message: room.name });
  });

  // Send message
  socket.on("send_message", async (payload) => {
    const { shipmentId, senderId, message } = payload;

    const room = await Room.findOne({ shipment: shipmentId });

    if (!room || !room.members.includes(senderId)) {
      return socket.emit("error", {
        message: "You are not authorized to send messages in this room.",
      });
    }

    socket.broadcast.to(shipmentId).emit("receive_message", {
      senderId,
      message,
    });
  });

  // typing
  socket.on("typing", (payload) => {
    socket.broadcast.to(payload.room).emit("user_is_typing", payload);
  });

  socket.on("disconnect", () => {
    console.log(`Socket ${socket.id} disconnected.`);
  });
});

// GLOBAL MIDDLEWARE
app.use(errorHandler);

// Handle unHandled routes
app.all("*", (req, res, next) => {
  res
    .status(404)
    .json({ message: `${req.originalUrl} is not found on this server` });
});

export default app;
