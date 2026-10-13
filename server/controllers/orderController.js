import Order from "../models/orders.js";
import Product from "../models/Product.js";

export const createOrder = async (req, res) => {
  const { products, shippingAddress, paymentMethod } = req.body;

  if (!products || products.length === 0) {
    return res.status(400).json({ message: "No products in order" });
  }

  try {
    let subtotal = 0;

    for (const item of products) {
      const product = await Product.findById(item.product);
      if (!product) {
        return res.status(404).json({ message: "Product not found" });
      }

      subtotal += product.offerPrice * item.quantity;
    }

    const gst = Math.round(subtotal * 0.05);
    const totalAmount = subtotal + gst;

    const newOrder = await Order.create({
      user: req.user._id,
      products,
      shippingAddress,
      paymentMethod,
      totalAmount,
    });

    res
      .status(201)
      .json({ message: "Order placed successfully", order: newOrder });
  } catch (err) {
    console.error("Order creation failed:", err);
    res.status(500).json({ message: "Server error" });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id })
      .populate("products.product")
      .sort({ createdAt: -1 });

    res.status(200).json({ orders });
  } catch (err) {
    res
      .status(500)
      .json({ message: "Failed to fetch orders", error: err.message });
  }
};

export const getAllOrdersForSeller = async (req, res) => {
  try {
    const orders = await Order.find()
      .sort({ createdAt: -1 })
      .populate("user", "name email")
      .populate("products.product", "name price image");

    res.status(200).json({ orders });
  } catch (err) {
    console.error("Error fetching all orders:", err);
    res.status(500).json({ message: "Failed to fetch orders" });
  }
};

// PUT /api/orders/:id/status
export const updateOrderStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res
        .status(404)
        .json({ success: false, message: "Order not found" });
    }

    order.status = status;
    await order.save();

    res.status(200).json({ success: true, message: "Status updated", order });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/orders/status/:id
export const getOrderStatus = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).select("status");

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
