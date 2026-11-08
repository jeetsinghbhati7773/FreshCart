import express from "express";
import internalAuth from "../middlewares/internalAuth.js";
import { getAllProducts, getProductById } from "../services/productService.js";
import { validateCartInventory } from "../services/inventoryService.js";
import prisma from "../config/prisma.js";

const router = express.Router();

// Apply internal service key verification to all internal routes
router.use(internalAuth);

/**
 * GET /api/internal/ai/products/search
 * Internal product catalog search with category, name, and stock filtering
 */
router.get("/products/search", async (req, res) => {
  try {
    const { query, category, limit = 10 } = req.query;
    const result = await getAllProducts({
      search: query,
      category: category && category !== "all" ? category : undefined,
      limit: parseInt(limit, 10) || 10,
      inStockOnly: false,
    });

    return res.json({
      success: true,
      total: result.total,
      products: result.products,
    });
  } catch (error) {
    console.error("Internal catalog search error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal search failed",
      error: error.message,
    });
  }
});

/**
 * GET /api/internal/ai/products/:id
 * Retrieve exact product with verified price and stock
 */
router.get("/products/:id", async (req, res) => {
  try {
    const product = await getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({
        success: false,
        message: "Product not found",
      });
    }

    return res.json({
      success: true,
      product,
    });
  } catch (error) {
    console.error("Internal product lookup error:", error);
    return res.status(500).json({
      success: false,
      message: "Internal product lookup failed",
      error: error.message,
    });
  }
});

/**
 * POST /api/internal/ai/products/batch
 * Bulk fetch product details for multiple IDs
 */
router.post("/products/batch", async (req, res) => {
  try {
    const { productIds } = req.body;
    if (!Array.isArray(productIds) || productIds.length === 0) {
      return res.status(400).json({
        success: false,
        message: "productIds array is required",
      });
    }

    const products = await prisma.product.findMany({
      where: {
        id: { in: productIds },
        isActive: true,
      },
    });

    return res.json({
      success: true,
      count: products.length,
      products,
    });
  } catch (error) {
    console.error("Batch product lookup error:", error);
    return res.status(500).json({
      success: false,
      message: "Batch lookup failed",
      error: error.message,
    });
  }
});

/**
 * POST /api/internal/ai/inventory/validate
 * Bulk validate stock availability for proposed items
 */
router.post("/inventory/validate", async (req, res) => {
  try {
    const { items } = req.body;
    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        message: "items array with {productId, quantity} is required",
      });
    }

    const validation = await validateCartInventory(items);
    return res.json({
      success: true,
      isValid: validation.isValid,
      errors: validation.errors,
    });
  } catch (error) {
    console.error("Inventory validation error:", error);
    return res.status(500).json({
      success: false,
      message: "Inventory validation failed",
      error: error.message,
    });
  }
});

export default router;

