import express from "express";
import {
  createProduct,
  getAllProducts,
  deleteProduct,
  getProductById,
  getBestSellers,
  getCategories,
  getProductsByCategory,
  updateProduct,
} from "../controllers/productController.js";
import authSeller from "../middlewares/authSeller.js";
import upload from "../middlewares/multer.js";

const router = express.Router();

// Public Product APIs
router.get("/", getAllProducts);
router.get("/bestsellers", getBestSellers);
router.get("/categories", getCategories);
router.get("/category/:name", getProductsByCategory);
router.get("/:id", getProductById);

// Seller/Admin APIs
router.post("/add", authSeller, upload.array("images", 4), createProduct);
router.put("/:id", authSeller, updateProduct);
router.delete("/:id", authSeller, deleteProduct);

export default router;
