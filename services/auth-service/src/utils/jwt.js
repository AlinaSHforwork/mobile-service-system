const jwt = require("jsonwebtoken");

const { JWT_SECRET, JWT_REFRESH_SECRET } = process.env;
if (!JWT_SECRET) throw new Error("JWT_SECRET is required");
if (!JWT_REFRESH_SECRET) throw new Error("JWT_REFRESH_SECRET is required");

const generateAccessToken = (payload) => {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    issuer: "mobile-repair-auth",
    audience: "mobile-repair-app",
  });
};

const generateRefreshToken = (payload) => {
  return jwt.sign(payload, JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || "30d",
    issuer: "mobile-repair-auth",
    audience: "mobile-repair-app",
  });
};

const verifyAccessToken = (token) => {
  return jwt.verify(token, JWT_SECRET, {
    issuer: "mobile-repair-auth",
    audience: "mobile-repair-app",
  });
};

const verifyRefreshToken = (token) => {
  return jwt.verify(token, JWT_REFRESH_SECRET, {
    issuer: "mobile-repair-auth",
    audience: "mobile-repair-app",
  });
};

module.exports = {
  generateAccessToken,
  generateRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
