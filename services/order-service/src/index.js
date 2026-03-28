import express from "express";
import cors from "cors";
import "dotenv/config";

import pool from "./db/pool.js";
import { initOrderSchema } from "./db/init.js";

const app = express();
const PORT = process.env.PORT || 4002;

app.use(cors());
app.use(express.json());

// Test Route
app.get("/", (req, res) => {
  res.send("Order Service Works! Ready for Orders.");
});

app.get("/health", (req, res) => {
  res.json({
    status: "ok",
    service: "order-service",
    db: pool.ended ? "disconnected" : "connected",
    uptime: process.uptime(),
  });
});

// Connect with retry mechanism
const connectWithRetry = async () => {
  try {
    console.log("Connecting to PostgreSQL and ensuring schema...");
    await pool.query("select 1");
    await initOrderSchema();
    console.log("Order-Service ready with PostgreSQL schema");
    
    app.listen(PORT, () => {
      console.log(`Order Service listening on 0.0.0.0:${PORT}`);
    });
  } catch (err) {
    console.error("PostgreSQL connection failed, retrying in 5s:", err.message);
    setTimeout(connectWithRetry, 5000);
  }
};

connectWithRetry();

process.on("SIGTERM", async () => {
  try {
    await pool.end();
  } catch (err) {
    console.log(err);
    process.exit(1);
  }
});

export default app;
