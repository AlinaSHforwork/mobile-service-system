import express from "express";
import { body, param } from "express-validator";
import rateLimit from "express-rate-limit";
import { authenticate, requireRole } from "../middleware/auth.js";
import {
  createOrder,
  getOrders,
  getOrder,
  updateOrder,
  deleteOrder,
} from "../controllers/ordersController.js";

const router = express.Router();

const createLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 30,
  message: { success: false, message: "Too many orders created. Try again later." },
});

const createValidation = [
  body("deviceType").trim().notEmpty().withMessage("Device type is required").isLength({ max: 100 }),
  body("deviceModel").trim().notEmpty().withMessage("Device model is required").isLength({ max: 200 }),
  body("osVersion").trim().notEmpty().withMessage("OS version is required").isLength({ max: 100 }),
  body("issueDescription").trim().notEmpty().withMessage("Issue description is required").isLength({ min: 10, max: 2000 }),
  body("dateOfPurchase").optional({ nullable: true }).isISO8601().withMessage("Invalid date format"),
];

const updateValidation = [
  param("id").isUUID().withMessage("Invalid order ID"),
  body("status").optional().isIn([
    "new", "in progress", "waiting customer response", "waiting spare parts", "failed", "done",
  ]).withMessage("Invalid status"),
  body("technicianComment").optional().isLength({ max: 2000 }),
  body("cost").optional({ nullable: true }).isFloat({ min: 0 }).withMessage("Cost must be a positive number"),
];

// All routes require authentication
router.use(authenticate);

router.post("/", createLimiter, requireRole("client"), createValidation, createOrder);
router.get("/", getOrders);
router.get("/:id", param("id").isUUID(), getOrder);
router.put("/:id", requireRole("master", "client"), updateValidation, updateOrder);
router.delete("/:id", param("id").isUUID(), deleteOrder);

export default router;