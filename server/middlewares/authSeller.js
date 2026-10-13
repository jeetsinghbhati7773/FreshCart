import jwt from "jsonwebtoken";

const authSeller = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Not Authorized" });
  }

  const token = authHeader.split(" ")[1];

  try {
    const tokenDecode = jwt.verify(token, process.env.JWT_SECRET);

    if (tokenDecode.email === process.env.SELLER_EMAIL) {
      req.user = tokenDecode;
      next();
    } else {
      return res
        .status(403)
        .json({ success: false, message: "Access Denied: Not Seller" });
    }
  } catch (error) {
    return res
      .status(401)
      .json({ success: false, message: "Invalid Token", error: error.message });
  }
};

export default authSeller;
