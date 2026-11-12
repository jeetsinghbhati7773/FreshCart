import express from "express";
import internalAuth from "../middlewares/internalAuth.js";
import prisma from "../config/prisma.js";
import {
  getSellerOrdersIntelligence,
  getSellerOrderDetails,
  getInventoryIntelligence,
  getProductPerformanceAndRestock,
  getSalesAnalytics,
} from "../services/sellerAnalyticsService.js";
import {
  resolveOrderByIdOrShortCode,
  validateStatusTransition,
  updateOrderStatusWithLifecycle,
} from "../services/orderLifecycleService.js";
import { updateProduct } from "../services/productService.js";

const router = express.Router();
router.use(internalAuth);

/**
 * GET /api/internal/seller/orders
 */
router.get("/orders", async (req, res) => {
  try {
    const { status, timeframe = "all", needsAttention = "false", limit = "50" } = req.query;
    const data = await getSellerOrdersIntelligence({
      status: status || undefined,
      timeframe,
      needsAttention: needsAttention === "true",
      limit: Math.min(200, Math.max(1, parseInt(limit, 10) || 50)),
    });
    return res.json({ success: true, ...data });
  } catch (error) {
    console.error("Internal seller orders error:", error);
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/internal/seller/orders/:id
 */
router.get("/orders/:id", async (req, res) => {
  try {
    const data = await getSellerOrderDetails(req.params.id);
    if (data.ambiguous) {
      return res.status(409).json({
        success: false,
        ambiguous: true,
        candidates: data.candidates,
        message: `Multiple orders match "${req.params.id}". Please specify one of: ${data.candidates.join(", ")}`,
      });
    }
    if (!data.found) {
      return res.status(404).json({ success: false, message: `Order "${req.params.id}" not found.` });
    }
    return res.json({ success: true, order: data.order });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/internal/seller/orders/:id/prepare-status
 * Validates status transition without mutating DB; returns preview for confirmation.
 */
router.post("/orders/:id/prepare-status", async (req, res) => {
  try {
    const { status } = req.body;
    const { order, ambiguous, matches } = await resolveOrderByIdOrShortCode(req.params.id);
    if (ambiguous) {
      return res.status(409).json({
        success: false,
        ambiguous: true,
        candidates: matches.map((m) => `#${m.id.slice(-6).toUpperCase()}`),
        message: `Multiple orders match "${req.params.id}".`,
      });
    }
    if (!order) {
      return res.status(404).json({ success: false, message: `Order "${req.params.id}" not found.` });
    }

    const check = validateStatusTransition(order.status, status);
    if (!check.valid) {
      return res.status(400).json({ success: false, message: check.reason });
    }

    return res.json({
      success: true,
      actionType: "UPDATE_ORDER_STATUS",
      targetId: order.id,
      shortId: `#${order.id.slice(-6).toUpperCase()}`,
      currentStatus: order.status,
      proposedStatus: check.canonicalNext,
      customerName: order.user?.name || "Customer",
      totalAmount: order.totalAmount,
      currency: order.currency || "INR",
      willRestoreStock: check.canonicalNext === "Cancelled",
      summary: `Update order #${order.id.slice(-6).toUpperCase()} from "${order.status}" to "${check.canonicalNext}"${check.canonicalNext === "Cancelled" ? " (will restore product stock)" : ""}`,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * PUT /api/internal/seller/orders/:id/status
 * Executes validated order status transition (called after confirmation).
 */
router.put("/orders/:id/status", async (req, res) => {
  try {
    const { status } = req.body;
    const result = await updateOrderStatusWithLifecycle(req.params.id, status);
    return res.json({
      success: true,
      ...result,
    });
  } catch (error) {
    return res.status(error.statusCode || 500).json({
      success: false,
      message: error.message,
    });
  }
});

/**
 * GET /api/internal/seller/inventory
 */
router.get("/inventory", async (req, res) => {
  try {
    const { filter = "all", category, search, limit = "100" } = req.query;
    const data = await getInventoryIntelligence({
      filter,
      category: category || undefined,
      search: search || undefined,
      limit: Math.min(500, Math.max(1, parseInt(limit, 10) || 100)),
    });
    return res.json({ success: true, ...data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/internal/seller/inventory/search
 */
router.get("/inventory/search", async (req, res) => {
  try {
    const { query = "" } = req.query;
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        name: { contains: String(query).trim(), mode: "insensitive" },
      },
      orderBy: { name: "asc" },
      take: 15,
    });
    return res.json({ success: true, products });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * POST /api/internal/seller/inventory/products/prepare-stock
 * Resolves product by ID or name, checks ambiguity, calculates proposed stock without mutating DB.
 */
router.post("/inventory/products/prepare-stock", async (req, res) => {
  try {
    const { productId, productName, mode, quantity } = req.body;
    const qtyNum = parseInt(quantity, 10);
    if (isNaN(qtyNum) || qtyNum < 0) {
      return res.status(400).json({
        success: false,
        message: "Quantity must be a valid non-negative integer.",
      });
    }
    if (!["set", "add", "reduce"].includes(mode)) {
      return res.status(400).json({
        success: false,
        message: 'Mode must be one of "set", "add", or "reduce".',
      });
    }

    let product = null;
    if (productId) {
      product = await prisma.product.findUnique({ where: { id: productId } });
    } else if (productName) {
      const term = String(productName).trim();
      const exact = await prisma.product.findMany({
        where: { isActive: true, name: { equals: term, mode: "insensitive" } },
        take: 5,
      });
      if (exact.length === 1) {
        product = exact[0];
      } else {
        const matches = await prisma.product.findMany({
          where: { isActive: true, name: { contains: term, mode: "insensitive" } },
          orderBy: { name: "asc" },
          take: 10,
        });
        if (matches.length === 1) {
          product = matches[0];
        } else if (matches.length > 1) {
          return res.status(409).json({
            success: false,
            ambiguous: true,
            candidates: matches.map((m) => ({
              id: m.id,
              name: m.name,
              category: m.category,
              stockQuantity: m.stockQuantity,
              unit: m.unit,
            })),
            message: `Multiple products match "${term}". Please specify which product you mean.`,
          });
        }
      }
    }

    if (!product) {
      return res.status(404).json({
        success: false,
        message: `Product "${productName || productId}" not found.`,
      });
    }

    const currentStock = product.stockQuantity;
    let proposedStock = currentStock;
    if (mode === "set") {
      proposedStock = qtyNum;
    } else if (mode === "add") {
      proposedStock = currentStock + qtyNum;
    } else if (mode === "reduce") {
      proposedStock = Math.max(0, currentStock - qtyNum);
    }

    return res.json({
      success: true,
      actionType: "UPDATE_PRODUCT_STOCK",
      targetId: product.id,
      productName: product.name,
      category: product.category,
      unit: product.unit,
      mode,
      quantity: qtyNum,
      currentStock,
      proposedStock,
      summary: `Update stock for "${product.name}" from ${currentStock} to ${proposedStock} units (${mode === "set" ? `set to ${qtyNum}` : mode === "add" ? `+${qtyNum}` : `-${qtyNum}`})`,
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * PUT /api/internal/seller/inventory/products/:id/stock
 * Executes validated stock update (called after seller confirmation).
 */
router.put("/inventory/products/:id/stock", async (req, res) => {
  try {
    const { stockQuantity, lowStockThreshold } = req.body;
    const payload = {};
    if (stockQuantity !== undefined) {
      const parsed = parseInt(stockQuantity, 10);
      if (isNaN(parsed) || parsed < 0) {
        return res.status(400).json({
          success: false,
          message: "stockQuantity must be a non-negative integer.",
        });
      }
      payload.stockQuantity = parsed;
    }
    if (lowStockThreshold !== undefined) {
      payload.lowStockThreshold = Math.max(0, parseInt(lowStockThreshold, 10));
    }
    const updated = await updateProduct(req.params.id, payload);
    return res.json({ success: true, product: updated });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/internal/seller/analytics/sales
 */
router.get("/analytics/sales", async (req, res) => {
  try {
    const days = parseInt(req.query.days, 10) || 30;
    const data = await getSalesAnalytics(days);
    return res.json({ success: true, ...data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

/**
 * GET /api/internal/seller/analytics/performance
 */
router.get("/analytics/performance", async (req, res) => {
  try {
    const days = parseInt(req.query.days, 10) || 30;
    const data = await getProductPerformanceAndRestock(days);
    return res.json({ success: true, ...data });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

export default router;

