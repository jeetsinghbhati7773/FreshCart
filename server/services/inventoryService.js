import prisma from "../config/prisma.js";

/**
 * Check stock availability for a single product
 * @param {string} productId
 * @returns {Promise<{available: boolean, stockQuantity: number, inStock: boolean, isActive: boolean, product: any}>}
 */
export async function checkStock(productId) {
  const product = await prisma.product.findUnique({
    where: { id: productId },
    select: {
      id: true,
      name: true,
      price: true,
      offerPrice: true,
      inStock: true,
      stockQuantity: true,
      isActive: true,
    },
  });

  if (!product) {
    return { available: false, stockQuantity: 0, inStock: false, isActive: false, product: null };
  }

  const available = product.isActive && product.inStock && product.stockQuantity > 0;
  return {
    available,
    stockQuantity: product.stockQuantity,
    inStock: product.inStock,
    isActive: product.isActive,
    product,
  };
}

/**
 * Get available quantity for a product
 * @param {string} productId
 * @returns {Promise<number>}
 */
export async function getAvailableQuantity(productId) {
  const status = await checkStock(productId);
  return status.available ? status.stockQuantity : 0;
}

/**
 * Validate inventory for a list of items
 * @param {Array<{productId: string, quantity: number}>} items
 * @returns {Promise<{isValid: boolean, errors: Array<{productId: string, name: string, requested: number, available: number, reason: string}>}>}
 */
export async function validateCartInventory(items) {
  const errors = [];

  for (const item of items) {
    const { productId, quantity } = item;
    const { available, stockQuantity, product } = await checkStock(productId);

    if (!product || !product.isActive) {
      errors.push({
        productId,
        name: product ? product.name : "Unknown Product",
        requested: quantity,
        available: 0,
        reason: "Product is no longer available",
      });
    } else if (stockQuantity < quantity) {
      errors.push({
        productId,
        name: product.name,
        requested: quantity,
        available: stockQuantity,
        reason: stockQuantity === 0 ? "Out of stock" : `Only ${stockQuantity} units remaining in stock`,
      });
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Adjust stock for a product (decrement on order, increment on cancel)
 * @param {string} productId
 * @param {number} delta (negative to reduce, positive to restock)
 * @param {any} [client] - optional prisma transaction client
 */
export async function adjustStock(productId, delta, client = prisma) {
  const product = await client.product.findUnique({
    where: { id: productId },
    select: { stockQuantity: true },
  });

  if (!product) throw new Error(`Product not found: ${productId}`);

  const newQuantity = Math.max(0, product.stockQuantity + delta);
  return client.product.update({
    where: { id: productId },
    data: {
      stockQuantity: newQuantity,
      inStock: newQuantity > 0,
    },
  });
}

