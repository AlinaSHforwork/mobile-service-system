import { validationResult } from "express-validator";
import Message from "../models/Message.js";
import Order from "../models/Order.js";

// POST /:orderId/messages — add message to order chat
export const createMessage = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { content } = req.body;
    const { orderId } = req.params;

    // Verify order exists
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Verify user has access to this order
    if (req.user.role === "client" && order.client_id !== req.user.id) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    if (req.user.role === "master" && order.assigned_to !== req.user.id) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const message = await Message.create({
      orderId,
      senderId: req.user.id,
      senderRole: req.user.role,
      content,
    });

    return res.status(201).json({
      success: true,
      message: "Message sent",
      data: { message: Message.toSafeObject(message) },
    });
  } catch (err) {
    console.error("createMessage error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /:orderId/messages — get message history for an order
export const getMessages = async (req, res) => {
  try {
    const { orderId } = req.params;
    const { page = 1, limit = 50 } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    // Verify order exists
    const order = await Order.findById(orderId);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Verify user has access to this order
    if (req.user.role === "client" && order.client_id !== req.user.id) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    if (req.user.role === "master" && order.assigned_to !== req.user.id) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }

    const [messages, total] = await Promise.all([
      Message.findByOrderId(orderId, { limit: limitNum, offset }),
      Message.countByOrderId(orderId),
    ]);

    return res.json({
      success: true,
      data: {
        messages: messages.map(Message.toSafeObject),
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (err) {
    console.error("getMessages error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};
