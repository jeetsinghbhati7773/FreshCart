import express from "express";
import authUser from "../middlewares/authUser.js";
import aiMemoryController from "../controllers/aiMemoryController.js";

const router = express.Router();

// Strict user authentication required for all memory management endpoints
router.use(authUser);

router.get("/settings", (req, res) => aiMemoryController.getSettings(req, res));
router.put("/settings", (req, res) => aiMemoryController.updateSettings(req, res));
router.post("/sync-orders", (req, res) => aiMemoryController.syncOrderMemories(req, res));

router.get("/", (req, res) => aiMemoryController.getMemories(req, res));
router.post("/", (req, res) => aiMemoryController.upsertMemory(req, res));
router.delete("/", (req, res) => aiMemoryController.clearAllMemories(req, res));

router.put("/:id", (req, res) => aiMemoryController.updateMemory(req, res));
router.delete("/:id", (req, res) => aiMemoryController.deleteMemory(req, res));

export default router;
