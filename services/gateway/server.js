const express = require("express");
const cors = require("cors");
const { createProxyMiddleware } = require("http-proxy-middleware");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 8000;

// CORS
app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

const AUTH_URL = process.env.AUTH_SERVICE_URL || "http://localhost:4001";
const ORDER_URL = process.env.ORDER_SERVICE_URL || "http://localhost:4002";

// Auth proxy
// /api/auth/login  →  http://auth-service:4001/login
app.use(
  "/api/auth",
  createProxyMiddleware({
    target: AUTH_URL,
    changeOrigin: true,
    pathRewrite: { "^/api/auth": "" },
    onError(err, req, res) {
      console.error("[gateway] auth proxy error:", err.message);
      if (!res.headersSent) {
        res
          .status(502)
          .json({ success: false, message: "Auth service unavailable" });
      }
    },
  }),
);

// Order proxy
app.use(
  "/api/orders",
  createProxyMiddleware({
    target: ORDER_URL,
    changeOrigin: true,
    pathRewrite: { "^/api/orders": "" },
    onError(err, req, res) {
      console.error("[gateway] order proxy error:", err.message);
      if (!res.headersSent) {
        res
          .status(502)
          .json({ success: false, message: "Order service unavailable" });
      }
    },
  }),
);

app.get("/health", (req, res) => {
  res.json({ status: "ok", service: "gateway", authTarget: AUTH_URL });
});

app.get("/", (req, res) => {
  res.json({ message: "API Gateway running" });
});

app.listen(PORT, "0.0.0.0", () => {
  console.log(`🚀 Gateway listening on 0.0.0.0:${PORT}`);
  console.log(`   Auth  → ${AUTH_URL}`);
  console.log(`   Order → ${ORDER_URL}`);
});
