import express from "express";
import authUser from "../middlewares/authUser.js";
import aiConversationController from "../controllers/aiConversationController.js";

const router = express.Router();

// Strict user authentication required for all conversation management endpoints
router.use(authUser);

router.post("/", (req, res) => aiConversationController.createConversation(req, res));
router.get("/", (req, res) => aiConversationController.getConversations(req, res));
router.get("/:id", (req, res) => aiConversationController.getConversation(req, res));
router.patch("/:id", (req, res) => aiConversationController.updateConversation(req, res));
router.delete("/:id", (req, res) => aiConversationController.deleteConversation(req, res));

router.get("/:id/messages", (req, res) => aiConversationController.getMessages(req, res));
router.post("/:id/messages", (req, res) => aiConversationController.sendMessage(req, res));

export default router;
