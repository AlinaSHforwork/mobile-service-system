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
  assignOrder,
  getMyOrders,
} from "../controllers/ordersController.js";
import { createMessage, getMessages } from "../controllers/messagesController.js";

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
    "new", "waiting customer response", "waiting spare parts", "in progress", "failed", "done",
  ]).withMessage("Invalid status"),
  body("technicianComment").optional().isLength({ max: 2000 }),
  body("cost").optional({ nullable: true }).isFloat({ min: 0 }).withMessage("Cost must be a positive number"),
];

const messageValidation = [
  param("orderId").isUUID().withMessage("Invalid order ID"),
  body("content").trim().notEmpty().withMessage("Message content is required").isLength({ min: 1, max: 2000 }),
];

router.use(authenticate);

router.post("/", createLimiter, requireRole("client"), createValidation, createOrder);
router.get("/", getOrders);
router.get("/my/orders", getMyOrders); 
router.get("/:id", param("id").isUUID(), getOrder);
router.put("/:id", requireRole("master", "client"), updateValidation, updateOrder);
router.put("/:id/assign", requireRole("master"), assignOrder);
router.delete("/:id", param("id").isUUID(), deleteOrder);
router.post("/:orderId/messages", messageValidation, createMessage);
router.get("/:orderId/messages", param("orderId").isUUID(), getMessages);

export default router;