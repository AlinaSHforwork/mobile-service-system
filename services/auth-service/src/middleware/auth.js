const { verifyAccessToken } = require("../utils/jwt");
const User = require("../models/User");
const Master = require("../models/Master");

const authenticate = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res
        .status(401)
        .json({ success: false, message: "Access token required" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = verifyAccessToken(token);

    if (decoded.role === "master") {
      const master = await Master.findById(decoded.id);
      if (!master || !master.is_active) {
        return res
          .status(401)
          .json({ success: false, message: "Master not found or deactivated" });
      }
      req.user = {
        id: master.id,
        _id: master.id,
        username: master.username,
        displayName: master.display_name || master.username,
        role: "master",
        is_active: true,
      };
      return next();
    }

    const user = await User.findById(decoded.id);
    if (!user || !user.is_active) {
      return res
        .status(401)
        .json({ success: false, message: "User not found or deactivated" });
    }

    req.user = user;
    next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        success: false,
        message: "Token expired",
        code: "TOKEN_EXPIRED",
      });
    }
    return res.status(401).json({ success: false, message: "Invalid token" });
  }
};

const requireRole = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: "Not authenticated" });
    }
    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ success: false, message: "Insufficient permissions" });
    }
    next();
  };
};

module.exports = { authenticate, requireRole };