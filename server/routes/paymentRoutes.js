import express from "express";
import { createRazorpayOrder } from "../controllers/paymentController.js";
import authUser from "../middlewares/authUser.js";

const router = express.Router();
router.post("/razorpay", authUser, createRazorpayOrder);
export default router;
