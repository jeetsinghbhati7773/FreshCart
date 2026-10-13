// server.js
import express from "express";
import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import http from "http";
import { Server as socketIO } from "socket.io";

import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import sellerRoutes from "./routes/sellerRoutes.js";
import productRoutes from "./routes/productRoutes.js";
import OrderRoutes from "./routes/orders.js";
import authRoutes from "./routes/userAuth.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import chatRoutes from "./routes/chatRoutes.js";
import otpRoutes from "./routes/otpRoutes.js";
import { initSocket } from "./sockets/chatSocket.js";
import subscribeRoute from "./routes/subscribe.js";

// Load .env variables
dotenv.config();

const app = express();
const port = process.env.PORT || 10000;
const server = http.createServer(app);

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

// ✅ Allow frontend from localhost & Vercel
const allowedOrigins = [
  "http://localhost:5173",
  "https://hitman-grocery.vercel.app",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  })
);

// Basic test route
app.get("/", (req, res) => res.send("API is working"));

// Mount routes
app.use("/api/users", userRoutes);
app.use("/api/seller", sellerRoutes);
app.use("/api/products", productRoutes);
app.use("/api/orders", OrderRoutes);
app.use("/api/userAuth", authRoutes);
app.use("/api/payment", paymentRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/otp", otpRoutes);
app.use("/api/subscribe", subscribeRoute);

// 404 page
app.use((req, res) => {
  res.status(404).render("404", { path: req.originalUrl });
});

// Start the server and connect socket
const startServer = async () => {
  await connectDB();

  server.listen(port, () =>
    console.log(`🚀 Server running at http://localhost:${port}`)
  );

  const io = new socketIO(server, {
    cors: {
      origin: allowedOrigins,
      methods: ["GET", "POST", "PUT", "DELETE"],
      credentials: true,
    },
  });

  initSocket(io);
};

startServer();
