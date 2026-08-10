import express from "express";
import dotenv from "dotenv";
dotenv.config(); // configed so all env varaibles will be accessible
import connectDb from "./config/db.js";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRouter from "./routes/auth.routes.js";
import userRouter from "./routes/user.routes.js";
import shopRouter from "./routes/shop.routes.js";
import itemRouter from "./routes/item.routes.js";
import orderRouter from "./routes/order.routes.js";
// ACCESING http DIRECTLY FOR SOCKET REAL TIME
import http from "http";
import { Server } from "socket.io";
import { socketHandler } from "./socket.js";

const app = express();

// Create the real HTTP server and place your Express app inside it.
const server = http.createServer(app);

// Create Socket.IO server on top of same server.

const io = new Server(server, {
  // Connecting Socket with our Frontend
  cors: {
    origin: [
  "http://localhost:5173",
  "https://food-delivery-ten-woad.vercel.app"
],
    credentials: true,
    methods: ["POST", "GET", "DELETE"],
  },
});
// ALL Methods, tools all stored in app to use globally
app.set("io", io);

const port = process.env.PORT || 5000;

// app.use() = Setup Rules + Connect Routes before handling Requests

// Allow FROTNEND to Talk to BACKEND
app.use(
  cors({
    origin: [
  "http://localhost:5173",
  "https://food-delivery-ten-woad.vercel.app"
],
    credentials: true,
  }),
);

// Convert Frontend Data into JSON format for Backend req.body else backend wont be able to read
app.use(express.json());

// READ COOKIE FROM BROWSER req.cookies.token
app.use(cookieParser());

// For Different API Route Connections
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/shop", shopRouter);
app.use("/api/item", itemRouter);
app.use("/api/order", orderRouter);

// SOCKET SETUP AND CHANGED app.listen to server.listen
socketHandler(io);
server.listen(port, () => {
  connectDb();
  console.log(`server started at ${port}`);
});
