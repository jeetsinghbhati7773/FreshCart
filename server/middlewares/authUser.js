import jwt from "jsonwebtoken";
import prisma from "../config/prisma.js";

/**
 * Resolve or provision the shared guest user when login is disabled.
 */
async function getOrCreateGuestUser() {
  return prisma.user.upsert({
    where: { email: "guest@freshcart.local" },
    update: {},
    create: {
      name: "Guest Shopper",
      email: "guest@freshcart.local",
      password: "guest-login-disabled",
    },
    select: {
      id: true,
      name: true,
      email: true,
      createdAt: true,
      updatedAt: true,
    },
  });
}

const authUser = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (authHeader && authHeader.startsWith("Bearer ")) {
      const token = authHeader.split(" ")[1];
      if (token && token !== "null" && token !== "undefined") {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await prisma.user.findUnique({
          where: { id: decoded.id },
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
            updatedAt: true,
          },
        });
        if (user) {
          req.user = user;
          return next();
        }
      }
    }

    // Login disabled: fall back to guest shopper instead of rejecting with 401.
    // if (!authHeader || !authHeader.startsWith("Bearer ")) {
    //   return res.status(401).json({ success: false, message: "Not authorized, token missing" });
    // }
    req.user = await getOrCreateGuestUser();
    return next();
  } catch (err) {
    // Token invalid/expired while login is disabled -> continue as guest shopper.
    // return res.status(401).json({ success: false, message: "Invalid or expired token", error: err.message });
    try {
      req.user = await getOrCreateGuestUser();
      return next();
    } catch (guestErr) {
      return res.status(500).json({
        success: false,
        message: "Failed to resolve guest session",
        error: guestErr.message,
      });
    }
  }
};

export default authUser;
