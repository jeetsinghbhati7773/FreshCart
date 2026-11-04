import * as cartService from "../services/cartService.js";
import { validateCartInventory } from "../services/inventoryService.js";

/**
 * Extract user or session identifier from request
 */
function getCartIdentifiers(req) {
  const userId = req.user?.id || null;
  // Session ID can come from header, cookie, or query param
  const sessionId = req.headers["x-session-id"] || req.cookies?.sessionId || req.body?.sessionId || req.query?.sessionId || null;
  return { userId, sessionId };
}

/**
 * GET /api/cart
 * Retrieve current user or session cart
 */
export async function getCart(req, res) {
  try {
    const { userId, sessionId } = getCartIdentifiers(req);

    if (!userId && !sessionId) {
      return res.status(200).json({
        success: true,
        cart: {
          items: [],
          itemCount: 0,
          subtotal: 0,
          mrpTotal: 0,
          savings: 0,
          gst: 0,
          totalAmount: 0,
          currency: "INR",
          currencySymbol: "₹",
          warnings: [],
          isValidForCheckout: false,
        },
      });
    }

    const cart = await cartService.getOrCreateCart({ userId, sessionId });
    res.status(200).json({ success: true, cart });
  } catch (error) {
    console.error("Get Cart Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * POST /api/cart/items
 * Add product to cart
 */
export async function addItem(req, res) {
  try {
    const { userId, sessionId } = getCartIdentifiers(req);
    const { productId, quantity = 1 } = req.body;

    if (!productId) {
      return res.status(400).json({ success: false, message: "productId is required" });
    }

    const numQty = parseInt(quantity, 10);
    if (isNaN(numQty) || numQty <= 0) {
      return res.status(400).json({ success: false, message: "quantity must be a positive integer" });
    }

    const cart = await cartService.addItemToCart({
      userId,
      sessionId,
      productId,
      quantity: numQty,
    });

    res.status(200).json({
      success: true,
      message: "Item added to cart",
      cart,
    });
  } catch (error) {
    console.error("Add to Cart Error:", error);
    res.status(400).json({ success: false, message: error.message });
  }
}

/**
 * PUT /api/cart/items/:productId
 * Update item quantity
 */
export async function updateItem(req, res) {
  try {
    const { userId, sessionId } = getCartIdentifiers(req);
    const { productId } = req.params;
    const { quantity } = req.body;

    if (quantity === undefined) {
      return res.status(400).json({ success: false, message: "quantity is required" });
    }

    const numQty = parseInt(quantity, 10);
    if (isNaN(numQty)) {
      return res.status(400).json({ success: false, message: "quantity must be a valid number" });
    }

    const cart = await cartService.updateCartItem({
      userId,
      sessionId,
      productId,
      quantity: numQty,
    });

    res.status(200).json({
      success: true,
      message: numQty <= 0 ? "Item removed from cart" : "Cart updated",
      cart,
    });
  } catch (error) {
    console.error("Update Cart Error:", error);
    res.status(400).json({ success: false, message: error.message });
  }
}

/**
 * DELETE /api/cart/items/:productId
 * Remove item from cart
 */
export async function removeItem(req, res) {
  try {
    const { userId, sessionId } = getCartIdentifiers(req);
    const { productId } = req.params;

    const cart = await cartService.removeCartItem({
      userId,
      sessionId,
      productId,
    });

    res.status(200).json({
      success: true,
      message: "Item removed from cart",
      cart,
    });
  } catch (error) {
    console.error("Remove from Cart Error:", error);
    res.status(400).json({ success: false, message: error.message });
  }
}

/**
 * DELETE /api/cart
 * Clear entire cart
 */
export async function clearCart(req, res) {
  try {
    const { userId, sessionId } = getCartIdentifiers(req);

    const cart = await cartService.clearCart({ userId, sessionId });

    res.status(200).json({
      success: true,
      message: "Cart cleared",
      cart,
    });
  } catch (error) {
    console.error("Clear Cart Error:", error);
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * POST /api/cart/sync
 * Sync client-side items (from localStorage or guest) into backend cart
 */
export async function syncCart(req, res) {
  try {
    const { userId, sessionId } = getCartIdentifiers(req);
    const { items = [] } = req.body;

    if (!Array.isArray(items)) {
      return res.status(400).json({ success: false, message: "items must be an array" });
    }

    for (const item of items) {
      const pId = item._id || item.productId || item.id;
      const qty = parseInt(item.quantity, 10) || 1;
      if (pId && qty > 0) {
        try {
          await cartService.addItemToCart({
            userId,
            sessionId,
            productId: pId,
            quantity: qty,
          });
        } catch (e) {
          // Ignore individual item stock errors during sync
        }
      }
    }

    const cart = await cartService.getCart({ userId, sessionId });
    res.status(200).json({ success: true, message: "Cart synced", cart });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}

/**
 * POST /api/cart/validate
 * Validate inventory and current prices before proceeding to payment
 */
export async function validateCart(req, res) {
  try {
    const { userId, sessionId } = getCartIdentifiers(req);
    const cart = await cartService.getCart({ userId, sessionId });

    if (!cart || cart.items.length === 0) {
      return res.status(400).json({ success: false, message: "Cart is empty" });
    }

    const inventoryCheck = await validateCartInventory(
      cart.items.map((i) => ({ productId: i.productId, quantity: i.quantity }))
    );

    res.status(200).json({
      success: inventoryCheck.isValid,
      isValid: inventoryCheck.isValid,
      cart,
      errors: inventoryCheck.errors,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
}
