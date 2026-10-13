import express from "express";
import upload from "../middlewares/multer.js";
import authSeller from "../middlewares/authSeller.js";

import {
  loginSeller,
  logoutSeller,
  checkSellerAuth,
} from "../controllers/sellerController.js";

import {
  addProductWithImages,
  getAllProductsForSeller,
  updateProductDetails,
} from "../controllers/sellerProductController.js";

import { updateOrderStatus } from "../controllers/orderController.js";
const router = express.Router();

// Seller Auth Routes
router.post("/login", loginSeller);
router.get("/logout", logoutSeller);
router.get("/check-auth", authSeller, checkSellerAuth);

// Product Management Routes
router.post("/add-product", upload.array("images", 4), addProductWithImages);
router.get("/products", getAllProductsForSeller);
router.put("/update/:id", updateProductDetails);

// Update order status (seller only)
router.put("/update-order-status/:id", authSeller, updateOrderStatus);

export default router;
