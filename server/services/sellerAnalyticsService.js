import prisma from "../config/prisma.js";
import {
  normalizeOrderStatus,
  resolveOrderByIdOrShortCode,
} from "./orderLifecycleService.js";

const ATTENTION_STATUSES = ["Order Received", "Packing"];
const DELAY_THRESHOLD_HOURS = 24;

function getTimeframeStart(timeframe) {
  const now = new Date();
  switch ((timeframe || "all").toLowerCase()) {
    case "today": {
      const start = new Date(now);
      start.setHours(0, 0, 0, 0);
      return start;
    }
    case "week":
    case "this_week": {
      const start = new Date(now);
      const day = start.getDay();
      const diff = day === 0 ? 6 : day - 1; // Monday start
      start.setDate(start.getDate() - diff);
      start.setHours(0, 0, 0, 0);
      return start;
    }
    case "month":
    case "this_month": {
      return new Date(now.getFullYear(), now.getMonth(), 1);
    }
    default:
      return null;
  }
}

function formatOrderSummary(order) {
  const ageHours = Math.round(
    (Date.now() - new Date(order.createdAt).getTime()) / (1000 * 60 * 60)
  );
  const isDelayed =
    ATTENTION_STATUSES.includes(order.status) && ageHours >= DELAY_THRESHOLD_HOURS;

  return {
    id: order.id,
    shortId: `#${order.id.slice(-6).toUpperCase()}`,
    customerName: order.user?.name || "Customer",
    customerEmail: order.user?.email || null,
    shippingAddress: order.shippingAddress,
    totalAmount: order.totalAmount,
    currency: order.currency || "INR",
    status: order.status,
    paymentStatus: order.paymentStatus,
    paymentMethod: order.paymentMethod,
    itemCount: order.orderItems.reduce((sum, item) => sum + item.quantity, 0),
    items: order.orderItems.map((item) => ({
      productId: item.productId,
      name: item.productName || item.product?.name || "Unknown Product",
      quantity: item.quantity,
      unitPrice: item.unitPrice ?? item.product?.offerPrice ?? item.product?.price ?? 0,
      subtotal:
        item.subtotal ??
        (item.unitPrice ?? item.product?.offerPrice ?? item.product?.price ?? 0) *
          item.quantity,
    })),
    createdAt: order.createdAt,
    updatedAt: order.updatedAt,
    ageHours,
    isDelayed,
  };
}

/**
 * Retrieve seller orders with filtering and status breakdown.
 */
export async function getSellerOrdersIntelligence({
  status,
  timeframe = "all",
  needsAttention = false,
  limit = 50,
} = {}) {
  const allOrders = await prisma.order.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      user: { select: { id: true, name: true, email: true } },
      orderItems: {
        include: {
          product: {
            select: { id: true, name: true, price: true, offerPrice: true, unit: true },
          },
        },
      },
    },
  });

  // Compute global status distribution across all orders
  const byStatus = {
    "Order Received": 0,
    Packing: 0,
    "Out for Delivery": 0,
    Delivered: 0,
    Cancelled: 0,
  };

  let delayedCount = 0;
  let awaitingActionCount = 0;
  const nowMs = Date.now();

  for (const o of allOrders) {
    byStatus[o.status] = (byStatus[o.status] || 0) + 1;
    if (ATTENTION_STATUSES.includes(o.status)) {
      awaitingActionCount += 1;
      const ageHours = (nowMs - new Date(o.createdAt).getTime()) / (1000 * 60 * 60);
      if (ageHours >= DELAY_THRESHOLD_HOURS) {
        delayedCount += 1;
      }
    }
  }

  const start = getTimeframeStart(timeframe);
  const canonicalStatus = status ? normalizeOrderStatus(status) : null;

  let filtered = allOrders;
  if (start) {
    filtered = filtered.filter((o) => new Date(o.createdAt) >= start);
  }
  if (canonicalStatus) {
    filtered = filtered.filter((o) => o.status === canonicalStatus);
  }
  if (needsAttention) {
    filtered = filtered.filter((o) => ATTENTION_STATUSES.includes(o.status));
  }

  const formatted = filtered.slice(0, limit).map(formatOrderSummary);

  return {
    summary: {
      totalOrders: allOrders.length,
      filteredCount: filtered.length,
      byStatus,
      awaitingActionCount,
      delayedCount,
      delayThresholdHours: DELAY_THRESHOLD_HOURS,
    },
    orders: formatted,
  };
}

/**
 * Retrieve detailed information for a single order by UUID or short ID (#XXXXXX).
 */
export async function getSellerOrderDetails(orderIdOrShort) {
  const { order, ambiguous, matches } = await resolveOrderByIdOrShortCode(orderIdOrShort);
  if (ambiguous) {
    return {
      found: false,
      ambiguous: true,
      candidates: matches.map((m) => `#${m.id.slice(-6).toUpperCase()}`),
    };
  }
  if (!order) {
    return { found: false, ambiguous: false, order: null };
  }
  return {
    found: true,
    ambiguous: false,
    order: formatOrderSummary(order),
  };
}

/**
 * Inventory intelligence: out-of-stock, low-stock, and full stock overview.
 */
export async function getInventoryIntelligence({
  filter = "all",
  category,
  search,
  limit = 100,
} = {}) {
  const where = { isActive: true };
  if (category && category !== "all") {
    where.category = { equals: category, mode: "insensitive" };
  }
  if (search && search.trim()) {
    where.name = { contains: search.trim(), mode: "insensitive" };
  }

  const products = await prisma.product.findMany({
    where,
    orderBy: [{ stockQuantity: "asc" }, { name: "asc" }],
  });

  const mapped = products.map((p) => {
    const threshold = p.lowStockThreshold ?? 10;
    const isOutOfStock = !p.inStock || p.stockQuantity <= 0;
    const isLowStock = !isOutOfStock && p.stockQuantity <= threshold;
    return {
      id: p.id,
      name: p.name,
      category: p.category,
      brand: p.brand,
      unit: p.unit,
      price: p.price,
      offerPrice: p.offerPrice,
      stockQuantity: p.stockQuantity,
      inStock: p.inStock,
      lowStockThreshold: threshold,
      safetyStock: p.safetyStock ?? 5,
      leadTimeDays: p.leadTimeDays ?? 2,
      stockStatus: isOutOfStock
        ? "OUT_OF_STOCK"
        : isLowStock
          ? "LOW_STOCK"
          : "HEALTHY",
    };
  });

  const outOfStockCount = mapped.filter((p) => p.stockStatus === "OUT_OF_STOCK").length;
  const lowStockCount = mapped.filter((p) => p.stockStatus === "LOW_STOCK").length;
  const healthyCount = mapped.filter((p) => p.stockStatus === "HEALTHY").length;

  let filtered = mapped;
  if (filter === "out_of_stock") {
    filtered = mapped.filter((p) => p.stockStatus === "OUT_OF_STOCK");
  } else if (filter === "low_stock") {
    filtered = mapped.filter(
      (p) => p.stockStatus === "LOW_STOCK" || p.stockStatus === "OUT_OF_STOCK"
    );
  } else if (filter === "healthy") {
    filtered = mapped.filter((p) => p.stockStatus === "HEALTHY");
  }

  return {
    summary: {
      totalActiveProducts: mapped.length,
      outOfStockCount,
      lowStockCount,
      healthyCount,
    },
    products: filtered.slice(0, limit),
  };
}

/**
 * Deterministic product performance & restocking recommendations.
 */
export async function getProductPerformanceAndRestock(lookbackDays = 30) {
  const days = Math.max(1, Math.min(365, parseInt(lookbackDays, 10) || 30));
  const now = new Date();
  const windowStart = new Date(now.getTime() - days * 24 * 60 * 60 * 1000);
  const recent7Start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  const prior7Start = new Date(now.getTime() - 14 * 24 * 60 * 60 * 1000);

  const [products, orderItems] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true },
      orderBy: { name: "asc" },
    }),
    prisma.orderItem.findMany({
      where: {
        order: {
          status: { not: "Cancelled" },
          createdAt: { gte: windowStart },
        },
      },
      include: {
        order: { select: { id: true, createdAt: true } },
      },
    }),
  ]);

  const statsMap = new Map();
  for (const p of products) {
    statsMap.set(p.id, {
      product: p,
      unitsSold: 0,
      orderCount: 0,
      revenue: 0,
      recent7Units: 0,
      prior7Units: 0,
      orderIds: new Set(),
    });
  }

  for (const item of orderItems) {
    const entry = statsMap.get(item.productId);
    if (!entry) continue;
    entry.unitsSold += item.quantity;
    entry.orderIds.add(item.orderId);
    const unitPrice = item.unitPrice ?? entry.product.offerPrice ?? entry.product.price;
    entry.revenue += item.subtotal ?? unitPrice * item.quantity;

    const createdAt = new Date(item.order.createdAt);
    if (createdAt >= recent7Start) {
      entry.recent7Units += item.quantity;
    } else if (createdAt >= prior7Start && createdAt < recent7Start) {
      entry.prior7Units += item.quantity;
    }
  }

  const recommendations = [];
  const performanceList = [];

  for (const entry of statsMap.values()) {
    const p = entry.product;
    const orderCount = entry.orderIds.size;
    const avgDailySales = Number((entry.unitsSold / days).toFixed(2));
    const leadTime = p.leadTimeDays ?? 2;
    const safetyStock = p.safetyStock ?? 5;
    const threshold = p.lowStockThreshold ?? 10;

    // Formula: Reorder Point = Average Daily Sales * Supplier Lead Time + Safety Stock
    const hasSalesHistory = entry.unitsSold > 0;
    const reorderPoint = hasSalesHistory
      ? Math.ceil(avgDailySales * leadTime + safetyStock)
      : threshold;

    // Target Stock Level: 7 days of demand + reorder point (or 2x threshold if no sales yet)
    const targetStockLevel = hasSalesHistory
      ? Math.ceil(reorderPoint + avgDailySales * 7)
      : Math.max(threshold * 2, 20);

    const availableStock = p.stockQuantity;
    const suggestedReorderQty = Math.max(0, targetStockLevel - availableStock);
    const needsReorder = availableStock <= reorderPoint;

    let demandTrend = "steady";
    if (entry.recent7Units > entry.prior7Units && entry.recent7Units > 0) {
      demandTrend = "increasing";
    } else if (entry.recent7Units < entry.prior7Units) {
      demandTrend = "declining";
    }

    const row = {
      id: p.id,
      name: p.name,
      category: p.category,
      availableStock,
      lowStockThreshold: threshold,
      unitsSold: entry.unitsSold,
      orderCount,
      revenue: Math.round(entry.revenue),
      avgDailySales,
      recent7Units: entry.recent7Units,
      prior7Units: entry.prior7Units,
      demandTrend,
      leadTimeDays: leadTime,
      safetyStock,
      reorderPoint,
      targetStockLevel,
      suggestedReorderQty,
      needsReorder,
      isEstimate: !hasSalesHistory,
      assumptionNote: hasSalesHistory
        ? `Based on ${days}-day average daily sales (${avgDailySales}/day), ${leadTime}-day lead time, and ${safetyStock} safety stock.`
        : `Estimated using configured low-stock threshold (${threshold}) and safety stock (${safetyStock}) because no sales were recorded in the last ${days} days.`,
    };

    performanceList.push(row);
    if (needsReorder) {
      recommendations.push(row);
    }
  }

  const sortedByUnits = [...performanceList].sort((a, b) => b.unitsSold - a.unitsSold);
  const fastSelling = sortedByUnits.filter((p) => p.unitsSold > 0).slice(0, 5);
  const slowMoving = [...performanceList]
    .sort((a, b) => a.unitsSold - b.unitsSold)
    .slice(0, 5);

  recommendations.sort((a, b) => a.availableStock - b.availableStock);

  return {
    lookbackDays: days,
    fastSelling,
    slowMoving,
    increasingDemand: performanceList.filter((p) => p.demandTrend === "increasing"),
    decliningDemand: performanceList.filter((p) => p.demandTrend === "declining"),
    restockRecommendations: recommendations,
  };
}

/**
 * Full sales & business analytics from actual PostgreSQL orders.
 */
export async function getSalesAnalytics(lookbackDays = 30) {
  const now = new Date();
  const todayStart = new Date(now);
  todayStart.setHours(0, 0, 0, 0);

  const weekStart = getTimeframeStart("week");
  const monthStart = getTimeframeStart("month");

  const [orders, allProducts] = await Promise.all([
    prisma.order.findMany({
      include: {
        orderItems: {
          include: {
            product: {
              select: { id: true, name: true, category: true, offerPrice: true, price: true },
            },
          },
        },
      },
    }),
    prisma.product.findMany({
      where: { isActive: true },
      select: { id: true, name: true, category: true },
    }),
  ]);

  let todaySales = 0;
  let todayOrders = 0;
  let weeklyRevenue = 0;
  let monthlyRevenue = 0;
  let totalValidRevenue = 0;
  let totalValidOrders = 0;
  let totalCompletedOrders = 0;

  const orderStatusDistribution = {
    "Order Received": 0,
    Packing: 0,
    "Out for Delivery": 0,
    Delivered: 0,
    Cancelled: 0,
  };

  const productAgg = new Map();
  for (const p of allProducts) {
    productAgg.set(p.id, {
      productId: p.id,
      name: p.name,
      category: p.category,
      unitsSold: 0,
      revenue: 0,
      orderCount: 0,
    });
  }

  const categoryAgg = new Map();

  for (const order of orders) {
    orderStatusDistribution[order.status] =
      (orderStatusDistribution[order.status] || 0) + 1;

    if (order.status === "Cancelled") continue;

    totalValidOrders += 1;
    totalValidRevenue += order.totalAmount;

    if (order.status === "Delivered") {
      totalCompletedOrders += 1;
    }

    const createdAt = new Date(order.createdAt);
    if (createdAt >= todayStart) {
      todaySales += order.totalAmount;
      todayOrders += 1;
    }
    if (createdAt >= weekStart) {
      weeklyRevenue += order.totalAmount;
    }
    if (createdAt >= monthStart) {
      monthlyRevenue += order.totalAmount;
    }

    for (const item of order.orderItems) {
      const unitPrice =
        item.unitPrice ?? item.product?.offerPrice ?? item.product?.price ?? 0;
      const lineRevenue = item.subtotal ?? unitPrice * item.quantity;
      const category = item.product?.category || "Uncategorized";

      const pEntry = productAgg.get(item.productId) || {
        productId: item.productId,
        name: item.productName || item.product?.name || "Unknown Product",
        category,
        unitsSold: 0,
        revenue: 0,
        orderCount: 0,
      };
      pEntry.unitsSold += item.quantity;
      pEntry.revenue += lineRevenue;
      pEntry.orderCount += 1;
      productAgg.set(item.productId, pEntry);

      const cEntry = categoryAgg.get(category) || {
        category,
        unitsSold: 0,
        revenue: 0,
        orderItemCount: 0,
      };
      cEntry.unitsSold += item.quantity;
      cEntry.revenue += lineRevenue;
      cEntry.orderItemCount += 1;
      categoryAgg.set(category, cEntry);
    }
  }

  const productList = Array.from(productAgg.values()).map((p) => ({
    ...p,
    revenue: Math.round(p.revenue),
  }));
  const topFiveProducts = [...productList]
    .sort((a, b) => b.unitsSold - a.unitsSold || b.revenue - a.revenue)
    .slice(0, 5);
  const leastSellingProducts = [...productList]
    .sort((a, b) => a.unitsSold - b.unitsSold || a.revenue - b.revenue)
    .slice(0, 5);

  const categoryList = Array.from(categoryAgg.values())
    .map((c) => ({ ...c, revenue: Math.round(c.revenue) }))
    .sort((a, b) => b.revenue - a.revenue);

  const averageOrderValue =
    totalValidOrders > 0 ? Math.round((totalValidRevenue / totalValidOrders) * 100) / 100 : 0;

  return {
    currency: "INR",
    todaySales: Math.round(todaySales),
    todayOrders,
    weeklyRevenue: Math.round(weeklyRevenue),
    monthlyRevenue: Math.round(monthlyRevenue),
    totalRevenue: Math.round(totalValidRevenue),
    totalValidOrders,
    totalCompletedOrders,
    averageOrderValue,
    topFiveProducts,
    leastSellingProducts,
    popularCategories: [...categoryList].sort((a, b) => b.unitsSold - a.unitsSold),
    revenueByCategory: categoryList,
    orderStatusDistribution,
  };
}

