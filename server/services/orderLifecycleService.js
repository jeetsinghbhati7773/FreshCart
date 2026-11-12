import prisma from "../config/prisma.js";
import { adjustStock } from "./inventoryService.js";

export const ORDER_STATUSES = [
  "Order Received",
  "Packing",
  "Out for Delivery",
  "Delivered",
  "Cancelled",
];

// Canonical transition map
export const ALLOWED_TRANSITIONS = {
  "Order Received": ["Packing", "Out for Delivery", "Cancelled"],
  Packing: ["Out for Delivery", "Delivered", "Cancelled"],
  "Out for Delivery": ["Delivered", "Cancelled"],
  Delivered: [],
  Cancelled: [],
};

// Map natural-language aliases to canonical DB status strings
const STATUS_ALIASES = {
  "order received": "Order Received",
  received: "Order Received",
  pending: "Order Received",
  confirmed: "Packing",
  confirm: "Packing",
  processing: "Packing",
  packing: "Packing",
  packed: "Packing",
  shipped: "Out for Delivery",
  shipping: "Out for Delivery",
  "out for delivery": "Out for Delivery",
  dispatched: "Out for Delivery",
  delivered: "Delivered",
  completed: "Delivered",
  cancel: "Cancelled",
  cancelled: "Cancelled",
  canceled: "Cancelled",
};

/**
 * Normalize a requested status string or natural-language alias to a canonical status.
 * @param {string} rawStatus
 * @returns {string | null}
 */
export function normalizeOrderStatus(rawStatus) {
  if (!rawStatus || typeof rawStatus !== "string") return null;
  const trimmed = rawStatus.trim();
  if (ORDER_STATUSES.includes(trimmed)) return trimmed;
  return STATUS_ALIASES[trimmed.toLowerCase()] || null;
}

/**
 * Resolve an order by full UUID or short suffix (e.g. "A1B2C3" or "#A1B2C3").
 * Returns { order, ambiguous, matches }.
 */
export async function resolveOrderByIdOrShortCode(idOrShort) {
  if (!idOrShort || typeof idOrShort !== "string") {
    return { order: null, ambiguous: false, matches: [] };
  }

  const cleaned = idOrShort.trim().replace(/^#/, "");
  if (!cleaned) return { order: null, ambiguous: false, matches: [] };

  // Try exact UUID first
  const exact = await prisma.order.findUnique({
    where: { id: cleaned },
    include: {
      user: { select: { id: true, name: true, email: true } },
      orderItems: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              category: true,
              price: true,
              offerPrice: true,
              unit: true,
              image: true,
            },
          },
        },
      },
      payments: {
        select: {
          id: true,
          provider: true,
          status: true,
          amount: true,
          currency: true,
          createdAt: true,
        },
      },
    },
  });

  if (exact) {
    return { order: exact, ambiguous: false, matches: [exact] };
  }

  // Fallback: match suffix (Orders.jsx displays `#${order.id.slice(-6).toUpperCase()}`)
  const lower = cleaned.toLowerCase();
  const candidates = await prisma.order.findMany({
    where: {
      id: { endsWith: lower, mode: "insensitive" },
    },
    include: {
      user: { select: { id: true, name: true, email: true } },
      orderItems: {
        include: {
          product: {
            select: {
              id: true,
              name: true,
              category: true,
              price: true,
              offerPrice: true,
              unit: true,
              image: true,
            },
          },
        },
      },
      payments: {
        select: {
          id: true,
          provider: true,
          status: true,
          amount: true,
          currency: true,
          createdAt: true,
        },
      },
    },
    take: 5,
  });

  if (candidates.length === 1) {
    return { order: candidates[0], ambiguous: false, matches: candidates };
  }
  if (candidates.length > 1) {
    return { order: null, ambiguous: true, matches: candidates };
  }
  return { order: null, ambiguous: false, matches: [] };
}

/**
 * Validate whether transitioning from currentStatus -> nextStatus is allowed.
 */
export function validateStatusTransition(currentStatus, nextStatus) {
  const canonicalNext = normalizeOrderStatus(nextStatus);
  if (!canonicalNext) {
    return {
      valid: false,
      canonicalNext: null,
      reason: `Unsupported status "${nextStatus}". Valid statuses: ${ORDER_STATUSES.join(", ")}.`,
    };
  }

  if (currentStatus === canonicalNext) {
    return {
      valid: false,
      canonicalNext,
      reason: `Order is already in "${currentStatus}" status.`,
    };
  }

  const allowed = ALLOWED_TRANSITIONS[currentStatus] || [];
  if (!allowed.includes(canonicalNext)) {
    return {
      valid: false,
      canonicalNext,
      reason:
        allowed.length === 0
          ? `Order is in terminal status "${currentStatus}" and cannot be changed.`
          : `Cannot transition order from "${currentStatus}" to "${canonicalNext}". Allowed next statuses: ${allowed.join(", ")}.`,
    };
  }

  return { valid: true, canonicalNext, reason: null };
}

/**
 * Execute a validated order status update inside a Prisma transaction.
 * Restores product inventory if transitioning to "Cancelled".
 * Never modifies paymentStatus.
 */
export async function updateOrderStatusWithLifecycle(orderIdOrShort, requestedStatus) {
  const { order, ambiguous, matches } = await resolveOrderByIdOrShortCode(orderIdOrShort);

  if (ambiguous) {
    const err = new Error(
      `Multiple orders match "${orderIdOrShort}": ${matches.map((m) => `#${m.id.slice(-6).toUpperCase()}`).join(", ")}`
    );
    err.statusCode = 409;
    throw err;
  }

  if (!order) {
    const err = new Error(`Order not found: ${orderIdOrShort}`);
    err.statusCode = 404;
    throw err;
  }

  const check = validateStatusTransition(order.status, requestedStatus);
  if (!check.valid) {
    const err = new Error(check.reason);
    err.statusCode = 400;
    throw err;
  }

  const previousStatus = order.status;
  const nextStatus = check.canonicalNext;

  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.order.update({
      where: { id: order.id },
      data: { status: nextStatus },
      include: {
        user: { select: { id: true, name: true, email: true } },
        orderItems: {
          include: {
            product: {
              select: { id: true, name: true, price: true, image: true },
            },
          },
        },
      },
    });

    let stockRestored = false;
    if (nextStatus === "Cancelled" && order.orderItems.length > 0) {
      for (const item of order.orderItems) {
        await adjustStock(item.productId, item.quantity, tx);
      }
      stockRestored = true;
    }

    return { order: updated, stockRestored };
  });

  return {
    order: {
      ...result.order,
      _id: result.order.id,
      shortId: `#${result.order.id.slice(-6).toUpperCase()}`,
    },
    previousStatus,
    newStatus: nextStatus,
    stockRestored: result.stockRestored,
  };
}

