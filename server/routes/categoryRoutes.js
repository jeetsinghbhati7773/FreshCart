import express from "express";
import {
  getCategories,
  getProductsByCategory,
} from "../controllers/productController.js";

const router = express.Router();

router.get("/", getCategories);
router.get("/:name/products", getProductsByCategory);
router.get("/:name", getProductsByCategory);

export default router;
