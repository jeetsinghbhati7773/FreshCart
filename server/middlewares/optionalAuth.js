import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";

/**
 * Attaches req.user if a valid Bearer token is provided; otherwise proceeds as guest
 */
const optionalAuth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
        select: { id: true, name: true, email: true },
      });
      if (user) {
        req.user = user;
      }
    }
  } catch (err) {
    // Token is invalid/expired - proceed as guest without error
  }
  next();
};

export default optionalAuth;

