import express from "express";
import {
  createProduct,
  getAllProducts,
  deleteProduct,
  getProductById,
  getBestSellers,
} from "../controllers/productController.js";
import authSeller from "../middlewares/authSeller.js";

const router = express.Router();

router.get("/", getAllProducts); // Get all products
router.get("/bestsellers", getBestSellers); // Get best sellers
router.get("/:id", getProductById); // Get single product
router.post("/add", authSeller, createProduct); // Add product (seller)
router.delete("/:id", authSeller, deleteProduct); // Delete product (seller)

export default router;
