import jwt from "jsonwebtoken";

// SELLER LOGIN
export const loginSeller = async (req, res) => {
  const { email, password } = req.body;

  if (!email || !password)
    return res.status(400).json({ message: "All fields are required" });

  if (
    email === process.env.SELLER_EMAIL &&
    password === process.env.SELLER_PASSWORD
  ) {
    const token = jwt.sign({ email }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });

    return res.status(200).json({
      message: "Seller logged in successfully",
      token, // ✅ Send token in response body
    });
  } else {
    return res.status(401).json({ message: "Invalid credentials" });
  }
};

// SELLER LOGOUT (no need to clear cookie since no cookies used)
export const logoutSeller = (req, res) => {
  // Client can just remove token from localStorage
  res.status(200).json({ message: "Logged out successfully" });
};

// CHECK SELLER AUTH (protected route - use sellerAuthMiddleware)
export const checkSellerAuth = (req, res) => {
  res.status(200).json({ success: true });
};
