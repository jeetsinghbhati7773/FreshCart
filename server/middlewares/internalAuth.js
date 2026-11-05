/**
 * Internal Service Authentication Middleware
 * Ensures internal API endpoints can only be accessed by trusted microservices
 * (e.g. ShopPilot AI FastAPI service) presenting the correct INTERNAL_API_KEY.
 */
const internalAuth = (req, res, next) => {
  const secretKey = process.env.INTERNAL_API_KEY || "shoppilot_internal_secret_key_step2_2026";
  const incomingKey = req.headers["x-internal-api-key"];

  if (!incomingKey || incomingKey !== secretKey) {
    return res.status(403).json({
      success: false,
      message: "Forbidden: Invalid or missing internal service key",
    });
  }

  next();
};

export default internalAuth;

