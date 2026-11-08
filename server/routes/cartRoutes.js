import express from "express";
import {
  getCart,
  addItem,
  updateItem,
  removeItem,
  clearCart,
  syncCart,
  validateCart,
  batchAddItems,
} from "../controllers/cartController.js";
import optionalAuth from "../middlewares/optionalAuth.js";

const router = express.Router();

router.use(optionalAuth);

router.get("/", getCart);
router.post("/items", addItem);
router.put("/items/:productId", updateItem);
router.delete("/items/:productId", removeItem);
router.delete("/", clearCart);
router.post("/sync", syncCart);
router.post("/validate", validateCart);
router.post("/batch-add", batchAddItems);

export default router;

