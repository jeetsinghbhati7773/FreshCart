import prisma from "../config/prisma.js";
import { checkStock } from "./inventoryService.js";

/**
 * Find or create a cart for a user or session
 * @param {object} params - { userId?: string, sessionId?: string }
 */
export async function getOrCreateCart({ userId, sessionId }) {
  if (!userId && !sessionId) {
    throw new Error("Either userId or sessionId is required to get or create a cart");
  }

  let cart = null;

  if (userId) {
    cart = await prisma.cart.findFirst({
      where: { userId },
      include: {
        items: {
          include: {
            product: true,
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    // If logged in user also had a session cart, merge session cart items into user cart
    if (sessionId && (!cart || cart.sessionId !== sessionId)) {
      const sessionCart = await prisma.cart.findUnique({
        where: { sessionId },
        include: { items: true },
      });

      if (sessionCart && sessionCart.items.length > 0) {
        if (!cart) {
          cart = await prisma.cart.update({
            where: { id: sessionCart.id },
            data: { userId },
            include: {
              items: { include: { product: true }, orderBy: { createdAt: "asc" } },
            },
          });
        } else {
          // Merge items
          for (const sItem of sessionCart.items) {
            const existing = cart.items.find((i) => i.productId === sItem.productId);
            if (existing) {
              await prisma.cartItem.update({
                where: { id: existing.id },
                data: { quantity: existing.quantity + sItem.quantity },
              });
            } else {
              await prisma.cartItem.create({
                data: {
                  cartId: cart.id,
                  productId: sItem.productId,
                  quantity: sItem.quantity,
                },
              });
            }
          }
          await prisma.cart.delete({ where: { id: sessionCart.id } });
          cart = await prisma.cart.findUnique({
            where: { id: cart.id },
            include: {
              items: { include: { product: true }, orderBy: { createdAt: "asc" } },
            },
          });
        }
      }
    }
  } else if (sessionId) {
    cart = await prisma.cart.findUnique({
      where: { sessionId },
      include: {
        items: {
          include: {
            product: true,
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });
  }

  if (!cart) {
    cart = await prisma.cart.create({
      data: {
        userId: userId || null,
        sessionId: sessionId || null,
      },
      include: {
        items: {
          include: {
            product: true,
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });
  }

  return formatCartResponse(cart);
}

/**
 * Retrieve a cart by ID, userId, or sessionId with fresh prices and stock checks
 */
export async function getCart({ cartId, userId, sessionId }) {
  const where = {};
  if (cartId) where.id = cartId;
  else if (userId) where.userId = userId;
  else if (sessionId) where.sessionId = sessionId;
  else throw new Error("A cartId, userId, or sessionId is required");

  const cart = await prisma.cart.findFirst({
    where,
    include: {
      items: {
        include: {
          product: true,
        },
        orderBy: { createdAt: "asc" },
      },
    },
  });

  if (!cart) return null;
  return formatCartResponse(cart);
}

/**
 * Add an item to the cart (or increment quantity if already present)
 */
export async function addItemToCart({ cartId, userId, sessionId, productId, quantity = 1 }) {
  if (quantity <= 0) {
    throw new Error("Quantity must be greater than zero");
  }

  // Stock check
  const stockInfo = await checkStock(productId);
  if (!stockInfo.product || !stockInfo.isActive) {
    throw new Error("This product is no longer available");
  }
  if (!stockInfo.inStock || stockInfo.stockQuantity < 1) {
    throw new Error("Product is currently out of stock");
  }

  // Get or create cart
  let cart = await prisma.cart.findFirst({
    where: cartId ? { id: cartId } : userId ? { userId } : { sessionId },
  });

  if (!cart) {
    cart = await prisma.cart.create({
      data: { userId: userId || null, sessionId: sessionId || null },
    });
  }

  // Check if item already in cart
  const existingItem = await prisma.cartItem.findUnique({
    where: {
      cartId_productId: {
        cartId: cart.id,
        productId,
      },
    },
  });

  const targetQuantity = existingItem ? existingItem.quantity + quantity : quantity;

  if (targetQuantity > stockInfo.stockQuantity) {
    throw new Error(
      `Cannot add ${quantity} more. Maximum available stock is ${stockInfo.stockQuantity} (you already have ${existingItem ? existingItem.quantity : 0} in your cart)`
    );
  }

  if (existingItem) {
    await prisma.cartItem.update({
      where: { id: existingItem.id },
      data: { quantity: targetQuantity },
    });
  } else {
    await prisma.cartItem.create({
      data: {
        cartId: cart.id,
        productId,
        quantity: targetQuantity,
      },
    });
  }

  return getCart({ cartId: cart.id });
}

/**
 * Update quantity for an item in the cart
 */
export async function updateCartItem({ cartId, userId, sessionId, productId, quantity }) {
  const cart = await prisma.cart.findFirst({
    where: cartId ? { id: cartId } : userId ? { userId } : { sessionId },
  });

  if (!cart) throw new Error("Cart not found");

  if (quantity <= 0) {
    // Remove item if quantity is 0 or less
    await prisma.cartItem.deleteMany({
      where: { cartId: cart.id, productId },
    });
    return getCart({ cartId: cart.id });
  }

  // Stock check
  const stockInfo = await checkStock(productId);
  if (!stockInfo.product || !stockInfo.isActive) {
    throw new Error("Product is no longer available");
  }
  if (quantity > stockInfo.stockQuantity) {
    throw new Error(`Only ${stockInfo.stockQuantity} units available in stock`);
  }

  await prisma.cartItem.upsert({
    where: {
      cartId_productId: {
        cartId: cart.id,
        productId,
      },
    },
    update: { quantity },
    create: {
      cartId: cart.id,
      productId,
      quantity,
    },
  });

  return getCart({ cartId: cart.id });
}

/**
 * Remove an item from the cart
 */
export async function removeCartItem({ cartId, userId, sessionId, productId }) {
  const cart = await prisma.cart.findFirst({
    where: cartId ? { id: cartId } : userId ? { userId } : { sessionId },
  });

  if (!cart) throw new Error("Cart not found");

  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id, productId },
  });

  return getCart({ cartId: cart.id });
}

/**
 * Clear all items from a cart
 */
export async function clearCart({ cartId, userId, sessionId }) {
  const cart = await prisma.cart.findFirst({
    where: cartId ? { id: cartId } : userId ? { userId } : { sessionId },
  });

  if (!cart) return null;

  await prisma.cartItem.deleteMany({
    where: { cartId: cart.id },
  });

  return getCart({ cartId: cart.id });
}

/**
 * Pure helper to calculate cart totals and formatting from PostgreSQL fresh data
 */
export function formatCartResponse(cart) {
  let subtotal = 0;
  let originalTotal = 0;
  let totalItemsCount = 0;
  const items = [];
  const warnings = [];

  for (const item of cart.items || []) {
    const product = item.product;
    if (!product) continue;

    const offerPrice = product.offerPrice;
    const mrp = product.price;
    const qty = item.quantity;

    const isAvailable = product.isActive && product.inStock && product.stockQuantity > 0;
    const isSufficient = isAvailable && product.stockQuantity >= qty;

    if (!isAvailable) {
      warnings.push(`"${product.name}" is currently out of stock.`);
    } else if (!isSufficient) {
      warnings.push(`"${product.name}" only has ${product.stockQuantity} items in stock (you requested ${qty}).`);
    }

    const itemTotal = offerPrice * qty;
    subtotal += itemTotal;
    originalTotal += mrp * qty;
    totalItemsCount += qty;

    items.push({
      id: item.id,
      productId: product.id,
      name: product.name,
      category: product.category,
      brand: product.brand,
      unit: product.unit,
      price: mrp,
      offerPrice: offerPrice,
      image: product.image?.[0] || "",
      images: product.image || [],
      quantity: qty,
      subtotal: itemTotal,
      inStock: isAvailable,
      availableStock: product.stockQuantity,
      isSufficient,
    });
  }

  const gst = Math.round(subtotal * 0.05);
  const totalAmount = subtotal + gst;
  const savings = Math.max(0, originalTotal - subtotal);

  return {
    cartId: cart.id,
    userId: cart.userId,
    sessionId: cart.sessionId,
    items,
    itemCount: totalItemsCount,
    distinctItemCount: items.length,
    subtotal: Math.round(subtotal * 100) / 100,
    mrpTotal: Math.round(originalTotal * 100) / 100,
    savings: Math.round(savings * 100) / 100,
    shippingFee: 0,
    gst,
    totalAmount,
    currency: "INR",
    currencySymbol: "₹",
    warnings,
    isValidForCheckout: items.length > 0 && warnings.length === 0,
  };
}
