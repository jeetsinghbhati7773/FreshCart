import express from "express";
import {
  sendMessage,
  getMessages,
  getAllUsersInChat,
  getUnreadStatus,
  markMessagesAsRead,
} from "../controllers/chatController.js";

const router = express.Router();

// GET /api/chat/all-users
router.get("/all-users", getAllUsersInChat);

// GET /api/chat/unread-status (must come before :senderId)
router.get("/unread-status", getUnreadStatus);

// POST /api/chat/send
router.post("/send", sendMessage);

// GET /api/chat/:senderId
router.get("/:senderId", getMessages);

// POST /api/chat/mark-read/:userId
router.post("/mark-read/:userId", markMessagesAsRead);

export default router;
