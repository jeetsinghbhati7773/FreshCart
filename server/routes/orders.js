import express from "express";
import authUser from "../middlewares/authUser.js";
import {
  createOrder,
  getMyOrders,
  getAllOrdersForSeller,
  updateOrderStatus,
  getOrderStatus,
} from "../controllers/orderController.js";

const router = express.Router();

router.post("/", authUser, createOrder);
router.get("/my", authUser, getMyOrders);
router.get("/all", getAllOrdersForSeller);

// User checks status by Order ID (no auth needed)
router.get("/status/:id", getOrderStatus);

export default router;
