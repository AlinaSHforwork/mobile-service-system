import express from "express";
import cors from "cors";
import cookie from "cookie";
import crypto from "crypto";
import { createProxyMiddleware } from "http-proxy-middleware";
import "dotenv/config";

const app = express();
const PORT = process.env.PORT || 8000;

app.use(
  cors({
    origin: true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-csrf-token"],
  }),
);

const CSRF_SECRET = process.env.CSRF_SECRET;
if (!CSRF_SECRET) throw new Error('CSRF_SECRET is required');
app.use((req, res, next) => {
  const cookies = req.headers.cookie ? cookie.parse(req.headers.cookie) : {};
  if (!cookies["csrf-token"]) {
    const token = crypto.createHmac("sha256", CSRF_SECRET).update(crypto.randomBytes(32)).digest("hex");
    const isProd = process.env.NODE_ENV === "production";
    res.setHeader("Set-Cookie", cookie.serialize("csrf-token", token, {
      httpOnly: false,
      sameSite: "lax",
      secure: isProd,
      path: "/",
      maxAge: 60 * 60 * 24,
    }));
  }
  if (["POST","PUT","PATCH","DELETE"].includes(req.method)) {
    const headerToken = req.headers["x-csrf-token"];
    const cookieToken = cookies["csrf-token"]; 
    if (!headerToken || !cookieToken || headerToken !== cookieToken) {
      return res.status(403).json({ success: false, message: "CSRF token invalid" });
    }
  }
  next();
});

const AUTH_URL = process.env.AUTH_SERVICE_URL;
const ORDER_URL = process.env.ORDER_SERVICE_URL;

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
  console.log(`Gateway listening on 0.0.0.0:${PORT}`);
  console.log(`   Auth  → ${AUTH_URL}`);
  console.log(`   Order → ${ORDER_URL}`);
});
