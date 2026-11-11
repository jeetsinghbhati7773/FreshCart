import Razorpay from "razorpay";

/**
 * Lazily return a configured Razorpay client, or null if credentials are absent.
 */
function getRazorpayClient() {
  const keyId = process.env.RAZORPAY_KEY_ID;
  const keySecret = process.env.RAZORPAY_SECRET;
  if (!keyId || !keySecret) {
    return null;
  }
  return new Razorpay({
    key_id: keyId,
    key_secret: keySecret,
  });
}

export const createRazorpayOrder = async (req, res) => {
  try {
    const razorpayInstance = getRazorpayClient();
    if (!razorpayInstance) {
      return res.status(503).json({
        success: false,
        message: "Razorpay is not configured on this server.",
      });
    }

    const { totalAmount } = req.body;
    const options = {
      amount: totalAmount * 100, // ₹ to paisa
      currency: "INR",
      receipt: `order_rcptid_${Math.random().toString(36).slice(2, 10)}`,
    };
    const order = await razorpayInstance.orders.create(options);
    res.status(200).json({ success: true, order });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: err.message });
  }
};
