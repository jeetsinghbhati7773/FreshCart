import prisma from "../config/prisma.js";
import { validateCartInventory, adjustStock } from "../services/inventoryService.js";
import { clearCart } from "../services/cartService.js";

export const createOrder = async (req, res) => {
  const { products, shippingAddress, paymentMethod } = req.body;

  if (!products || products.length === 0) {
    return res.status(400).json({ message: "No products in order" });
  }

  try {
    // Validate inventory for all items
    const inventoryCheck = await validateCartInventory(
      products.map((item) => ({ productId: item.product, quantity: item.quantity }))
    );

    if (!inventoryCheck.isValid) {
      return res.status(400).json({
        message: "Some items in your order are out of stock or have insufficient quantity",
        errors: inventoryCheck.errors,
      });
    }

    let subtotal = 0;

    for (const item of products) {
      const product = await prisma.product.findUnique({
        where: { id: item.product },
      });
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      subtotal += product.offerPrice * item.quantity;
    }

    const gst = Math.round(subtotal * 0.05);
    const totalAmount = subtotal + gst;

    // Use transaction for order creation and inventory decrement
    const newOrder = await prisma.$transaction(async (tx) => {
      const order = await tx.order.create({
        data: {
          userId: req.user.id,
          shippingAddress,
          paymentMethod,
          totalAmount,
          orderItems: {
            create: products.map((item) => ({
              productId: item.product,
              quantity: item.quantity,
            })),
          },
        },
        include: {
          orderItems: {
            include: {
              product: true,
            },
          },
        },
      });

      // Decrement stock for each item
      for (const item of products) {
        await adjustStock(item.product, -item.quantity, tx);
      }

      return order;
    });

    // Clear backend cart if user had one
    try {
      await clearCart({ userId: req.user.id });
    } catch (e) {
      // Non-critical if user had no backend cart
    }

    const formattedOrder = {
      ...newOrder,
      products: newOrder.orderItems.map((item) => ({
        product: item.product,
        quantity: item.quantity,
      })),
    };

    res
      .status(201)
      .json({ message: "Order placed successfully", order: formattedOrder });
  } catch (err) {
    console.error("Order creation failed:", err);
    res.status(500).json({ message: "Server error", error: err.message });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      where: { userId: req.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        orderItems: {
          include: {
            product: true,
          },
        },
        payments: true,
      },
    });

    const formattedOrders = orders.map((o) => ({
      ...o,
      _id: o.id,
      products: o.orderItems.map((item) => ({
        product: item.product,
        quantity: item.quantity,
      })),
    }));

    res.status(200).json({ orders: formattedOrders });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch orders", error: err.message });
  }
};

export const getAllOrdersForSeller = async (req, res) => {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
          },
        },
        orderItems: {
          include: {
            product: {
              select: {
                id: true,
                name: true,
                price: true,
                image: true,
              },
            },
          },
        },
      },
    });

    const formattedOrders = orders.map((o) => ({
      ...o,
      products: o.orderItems.map((item) => ({
        product: item.product,
        quantity: item.quantity,
      })),
    }));

    res.status(200).json({ orders: formattedOrders });
  } catch (err) {
    console.error("Error fetching all orders:", err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

// PUT /api/orders/:id/status
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await prisma.order.update({
      where: { id: req.params.id },
      data: { status },
    });

    res.status(200).json({ success: true, message: "Status updated", order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/orders/status/:id
export const getOrderStatus = async (req, res) => {
  try {
    const order = await prisma.order.findUnique({
      where: { id: req.params.id },
      select: { status: true },
    });

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    res.status(200).json({ success: true, status: order.status });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
