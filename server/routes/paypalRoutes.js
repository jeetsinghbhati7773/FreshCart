import express from "express";
import authUser from "../middlewares/authUser.js";
import paypalController from "../controllers/paypalController.js";

const router = express.Router();

// Public config
router.get("/config", paypalController.getConfig);

// Authenticated PayPal order endpoints
router.post("/create-order", authUser, paypalController.createPayPalOrder);
router.post("/capture-order", authUser, paypalController.capturePayPalOrder);
router.post("/cancel-order", authUser, paypalController.cancelPayPalOrder);
router.get("/status/:orderId", authUser, paypalController.getOrderStatus);

export default router;

