import express from "express";
import cors from "cors";
import "dotenv/config";

import pool from "./db/pool.js";
import { initOrderSchema } from "./db/init.js";
import orderRoutes from "./routes/orders.js";

const app = express();
const PORT = process.env.PORT || 4002;

app.use(cors({ origin: true, credentials: true }));
app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));

app.use("/", orderRoutes);

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "order-service",
    db: pool.ended ? "disconnected" : "connected",
    uptime: process.uptime(),
  });
});

app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route not found: ${req.method} ${req.path}` });
});

const connectWithRetry = async () => {
  try {
    console.log("Connecting to PostgreSQL and ensuring schema...");
    await pool.query("select 1");
    await initOrderSchema();
    console.log("Order-Service ready with PostgreSQL schema");
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Order Service listening on 0.0.0.0:${PORT}`);
    });
  } catch (err) {
    console.error("PostgreSQL connection failed, retrying in 5s:", err.message);
    setTimeout(connectWithRetry, 5000);
  }
};

connectWithRetry();

process.on("SIGTERM", async () => {
  try { await pool.end(); } catch (err) { console.log(err); process.exit(1); }
});

export default app;