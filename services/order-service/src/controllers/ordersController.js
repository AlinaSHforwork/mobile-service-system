import { validationResult } from "express-validator";
import Order, { VALID_STATUSES } from "../models/Order.js";

// POST / — create order (client only)
export const createOrder = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { deviceType, deviceModel, osVersion, dateOfPurchase, issueDescription } = req.body;

    const order = await Order.create({
      clientId: req.user.id,
      deviceType,
      deviceModel,
      osVersion,
      dateOfPurchase,
      issueDescription,
    });

    return res.status(201).json({
      success: true,
      message: "Order created successfully",
      data: { order: Order.toSafeObject(order) },
    });
  } catch (err) {
    console.error("createOrder error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET / — list orders
// Masters see all; clients see their own
export const getOrders = async (req, res) => {
  try {
    const { search = "", status = "", page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    let orders, total;

    if (req.user.role === "master") {
      [orders, total] = await Promise.all([
        Order.findAll({ limit: limitNum, offset, search, status }),
        Order.countAll({ search, status }),
      ]);
    } else {
      [orders, total] = await Promise.all([
        Order.findByClientId(req.user.id, { limit: limitNum, offset, search }),
        Order.countByClientId(req.user.id, { search }),
      ]);
    }

    return res.json({
      success: true,
      data: {
        orders: orders.map(Order.toSafeObject),
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (err) {
    console.error("getOrders error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /:id — get single order
export const getOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }
    // Clients can only view their own orders
    if (req.user.role === "client" && order.client_id !== req.user.id) {
      return res.status(403).json({ success: false, message: "Access denied" });
    }
    return res.json({ success: true, data: { order: Order.toSafeObject(order) } });
  } catch (err) {
    console.error("getOrder error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// PUT /:id — update order (master only for status/comment; client can't update)
export const updateOrder = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    let updateData = {};

    if (req.user.role === "master") {
      // Masters can only update orders assigned to them
      if (order.assigned_to && order.assigned_to !== req.user.id) {
        return res.status(403).json({ success: false, message: "This order is assigned to another master" });
      }
      
      const { status, technicianComment, cost } = req.body;
      if (status !== undefined) {
        if (!VALID_STATUSES.includes(status)) {
          return res.status(400).json({ success: false, message: "Invalid status value" });
        }
        updateData.status = status;
      }
      if (technicianComment !== undefined) updateData.technicianComment = technicianComment;
      if (cost !== undefined) updateData.cost = cost;
      // Only set assignedTo if not already assigned
      if (!order.assigned_to) {
        updateData.assignedTo = req.user.id;
      }
    } else {
      // Client can only update their own order if status is 'new'
      if (order.client_id !== req.user.id) {
        return res.status(403).json({ success: false, message: "Access denied" });
      }
      if (order.status !== "new") {
        return res.status(400).json({ success: false, message: "Order can only be edited when status is 'new'" });
      }
      const { deviceModel, osVersion, dateOfPurchase, issueDescription } = req.body;
      // Clients update basic info — we'll handle this via a raw query
      const res2 = await import("../db/pool.js").then(m => m.default.query(
        `update orders set device_model=$1, os_version=$2, date_of_purchase=$3, issue_description=$4 where id=$5 returning *`,
        [deviceModel || order.device_model, osVersion || order.os_version, dateOfPurchase || order.date_of_purchase, issueDescription || order.issue_description, order.id]
      ));
      return res.json({ success: true, data: { order: Order.toSafeObject(res2.rows[0]) } });
    }

    const updated = await Order.updateStatus(order.id, updateData);
    return res.json({ success: true, data: { order: Order.toSafeObject(updated) } });
  } catch (err) {
    console.error("updateOrder error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// DELETE /:id — delete order
// Masters can delete any; clients can only delete their own 'new' orders
export const deleteOrder = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    if (req.user.role === "client") {
      if (order.client_id !== req.user.id) {
        return res.status(403).json({ success: false, message: "Access denied" });
      }
      if (order.status !== "new") {
        return res.status(400).json({ success: false, message: "Only 'new' orders can be deleted" });
      }
    }

    await Order.delete(order.id);
    return res.json({ success: true, message: "Order deleted" });
  } catch (err) {
    console.error("deleteOrder error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// PUT /:id/assign — assign order to master (master only)
export const assignOrder = async (req, res) => {
  try {
    // Only masters can assign/claim orders
    if (req.user.role !== "master") {
      return res.status(403).json({ success: false, message: "Only masters can assign orders" });
    }

    const order = await Order.findById(req.params.id);
    if (!order) {
      return res.status(404).json({ success: false, message: "Order not found" });
    }

    // Update order to assign to current master
    const updated = await Order.updateStatus(order.id, {
      assignedTo: req.user.id,
    });

    return res.json({
      success: true,
      message: "Order assigned successfully",
      data: { order: Order.toSafeObject(updated) },
    });
  } catch (err) {
    console.error("assignOrder error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /my/orders — get orders assigned to current master
export const getMyOrders = async (req, res) => {
  try {
    if (req.user.role !== "master") {
      return res.status(403).json({ success: false, message: "Only masters can view assigned orders" });
    }

    const { search = "", status = "", page = 1, limit = 20 } = req.query;
    const pageNum = Math.max(1, parseInt(page));
    const limitNum = Math.min(100, Math.max(1, parseInt(limit)));
    const offset = (pageNum - 1) * limitNum;

    const [orders, total] = await Promise.all([
      Order.findByMasterId(req.user.id, { limit: limitNum, offset, search, status }),
      Order.countByMasterId(req.user.id, { search, status }),
    ]);

    return res.json({
      success: true,
      data: {
        orders: orders.map(Order.toSafeObject),
        pagination: {
          total,
          page: pageNum,
          limit: limitNum,
          totalPages: Math.ceil(total / limitNum),
        },
      },
    });
  } catch (err) {
    console.error("getMyOrders error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};