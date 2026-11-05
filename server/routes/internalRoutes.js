import express from "express";
import internalAuth from "../middlewares/internalAuth.js";
import { getAllProducts, getProductById } from "../services/productService.js";

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

export default router;

