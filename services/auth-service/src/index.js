import express from "express";
import pool from "./db/pool.js";
import { initAuthSchema } from "./db/init.js";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import rateLimit from "express-rate-limit";
import "dotenv/config";

import authRoutes from "./routes/auth.js";

const app = express();
const PORT = process.env.PORT || 4001;

app.use(helmet());

app.use(cors({ origin: true, credentials: true }));

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

if (process.env.NODE_ENV !== "test") {
  app.use(morgan("dev"));
}

const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(globalLimiter);

app.use("/", authRoutes);

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "auth-service",
    db: pool.ended ? "disconnected" : "connected",
    uptime: process.uptime(),
  });
});

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route not found: ${req.method} ${req.path}`,
  });
});

app.use((err, req, res) => {
  console.error("Unhandled error:", err);
  res.status(500).json({ success: false, message: "Internal server error" });
});

const connectWithRetry = async () => {
  try {
    console.log("Connecting to PostgreSQL and ensuring schema...");
    await pool.query("select 1");
    await initAuthSchema();
    console.log("Auth-Service ready with PostgreSQL");
  } catch (err) {
    console.error("PostgreSQL connection failed, retrying in 5s:", err.message);
    setTimeout(connectWithRetry, 5000);
  }
};

app.listen(PORT, "0.0.0.0", () => {
  console.log(`Auth Service listening on 0.0.0.0:${PORT}`);
});

connectWithRetry();

process.on("SIGTERM", async () => {
  try { 
    await pool.end();
  } catch (err){
    console.log(err)
    process.exit(1);
  }
  
});

export default app;
