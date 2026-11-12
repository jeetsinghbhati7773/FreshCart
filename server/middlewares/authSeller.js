import jwt from "jsonwebtoken";

const authSeller = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  // Seller login temporarily disabled: fall back to default seller if no valid Bearer token
  // if (!authHeader || !authHeader.startsWith("Bearer ")) {
  //   return res.status(401).json({ success: false, message: "Not Authorized" });
  // }

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    req.user = { email: process.env.SELLER_EMAIL || "admin@freshcart.com" };
    return next();
  }

  const token = authHeader.split(" ")[1];

  try {
    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);

    if (tokenDecode.email === process.env.SELLER_EMAIL) {
      req.user = tokenDecode;
      next();
    } else {
      // return res
      //   .status(403)
      //   .json({ success: false, message: "Access Denied: Not Seller" });
      req.user = { email: process.env.SELLER_EMAIL || "admin@freshcart.com" };
      next();
    }
  } catch (error) {
    // return res
    //   .status(401)
    //   .json({ success: false, message: "Invalid Token", error: error.message });
    req.user = { email: process.env.SELLER_EMAIL || "admin@freshcart.com" };
    next();
  }
};

export default authSeller;
