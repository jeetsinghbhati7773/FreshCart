import prisma from "../config/prisma.js";

const DEFAULT_HOLD_MINUTES = 15;

export class ReservationService {
  /**
   * Atomically reserve inventory items for an order being checked out via PayPal
   * Decrements stock and creates InventoryReservation records.
   * @param {string} orderId
   * @param {Array<{productId: string, quantity: number}>} items
   * @param {number} [holdMinutes=15]
   * @param {any} [txClient]
   * @returns {Promise<Array<any>>} Created reservation records
   */
  static async reserveInventory(orderId, items, holdMinutes = DEFAULT_HOLD_MINUTES, txClient = prisma) {
    const expiresAt = new Date(Date.now() + holdMinutes * 60 * 1000);
    const reservations = [];

    for (const item of items) {
      const { productId, quantity } = item;

      // 1. Fetch current stock with lock/fresh read
      const product = await txClient.product.findUnique({
        where: { id: productId },
        select: { id: true, name: true, stockQuantity: true, inStock: true, isActive: true },
      });

      if (!product || !product.isActive) {
        throw new Error(`Product "${product ? product.name : productId}" is no longer active.`);
      }

      if (product.stockQuantity < quantity) {
        throw new Error(
          `Insufficient stock for "${product.name}". Requested: ${quantity}, Available: ${product.stockQuantity}`
        );
      }

      // 2. Decrement product stock
      const newStock = product.stockQuantity - quantity;
      await txClient.product.update({
        where: { id: productId },
        data: {
          stockQuantity: newStock,
          inStock: newStock > 0,
        },
      });

      // 3. Create reservation record
      const resRecord = await txClient.inventoryReservation.create({
        data: {
          orderId,
          productId,
          reservedQuantity: quantity,
          status: "RESERVED",
          expiresAt,
        },
      });

      reservations.push(resRecord);
    }

    return reservations;
  }

  /**
   * Finalize and consume reservations when payment capture succeeds
   * @param {string} orderId
   * @param {any} [txClient]
   */
  static async consumeReservations(orderId, txClient = prisma) {
    return txClient.inventoryReservation.updateMany({
      where: {
        orderId,
        status: "RESERVED",
      },
      data: {
        status: "CONSUMED",
      },
    });
  }

  /**
   * Release reserved inventory back to product stock if payment fails, is cancelled, or expires
   * @param {string} orderId
   * @param {string} [reason="CANCELLED"]
   * @param {any} [txClient]
   */
  static async releaseReservations(orderId, reason = "RELEASED", txClient = prisma) {
    const activeReservations = await txClient.inventoryReservation.findMany({
      where: {
        orderId,
        status: "RESERVED",
      },
    });

    for (const res of activeReservations) {
      // Restore stock back to product
      await txClient.product.update({
        where: { id: res.productId },
        data: {
          stockQuantity: { increment: res.reservedQuantity },
          inStock: true,
        },
      });

      // Mark reservation as released/expired
      await txClient.inventoryReservation.update({
        where: { id: res.id },
        data: {
          status: reason === "EXPIRED" ? "EXPIRED" : "RELEASED",
        },
      });
    }

    return activeReservations.length;
  }

  /**
   * Periodic or on-demand cleanup: release any RESERVED items whose expiresAt < now
   */
  static async releaseExpiredReservations() {
    const now = new Date();
    const expired = await prisma.inventoryReservation.findMany({
      where: {
        status: "RESERVED",
        expiresAt: { lt: now },
      },
    });

    let count = 0;
    for (const res of expired) {
      await prisma.$transaction(async (tx) => {
        await tx.product.update({
          where: { id: res.productId },
          data: {
            stockQuantity: { increment: res.reservedQuantity },
            inStock: true,
          },
        });
        await tx.inventoryReservation.update({
          where: { id: res.id },
          data: { status: "EXPIRED" },
        });
      });
      count++;
    }

    return count;
  }
}

export default ReservationService;

