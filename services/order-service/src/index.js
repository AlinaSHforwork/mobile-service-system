const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
const PORT = process.env.PORT || 4002;

app.use(cors());
app.use(express.json());

// Connection to MongoDB / Підключення до БД
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Order-Service connected to MongoDB"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Test Route /Тестовий маршрут
app.get("/", (req, res) => {
  res.send("Order Service Works! Ready for Orders.");
});

app.listen(PORT, () => {
  console.log(`Order Service running on port ${PORT}`);
});
