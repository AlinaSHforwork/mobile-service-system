import { validationResult } from "express-validator";
import User from "../models/User.js";
import Master from "../models/Master.js";
import {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} from "../utils/jwt.js";

// POST /auth/login
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { username, password } = req.body;

    // Check masters table first
    const master = await Master.findOneByUsername(username, { withSensitive: true });

    if (master) {
      if (!master.is_active) {
        return res
          .status(403)
          .json({ success: false, message: "Master account is deactivated" });
      }

      const isMatch = await Master.comparePassword(master, password);
      if (!isMatch) {
        // Wrong password — do NOT fall through to client lookup,
        // just return generic invalid credentials message.
        return res
          .status(401)
          .json({ success: false, message: "Invalid username or password" });
      }

      await Master.recordLogin(master.id);

      const payload = {
        id: master.id,
        username: master.username,
        displayName: master.display_name || master.username,
        role: "master",
      };
      const accessToken = generateAccessToken(payload);
      const refreshToken = generateRefreshToken(payload);

      return res.status(200).json({
        success: true,
        message: "Master login successful",
        data: {
          user: Master.toSafeObject(master),
          accessToken,
          refreshToken,
        },
      });
    }

    // Client login 
    const user = await User.findOneByUsername(username, { withSensitive: true });

    if (!user) {
      return res
        .status(401)
        .json({ success: false, message: "Invalid username or password" });
    }

    if (User.isLocked(user)) {
      const lockRemaining = Math.ceil(
        (new Date(user.lock_until).getTime() - Date.now()) / 1000 / 60,
      );
      return res.status(423).json({
        success: false,
        message: `Account locked. Try again in ${lockRemaining} minute(s).`,
      });
    }

    const isMatch = await User.comparePassword(user, password);
    if (!isMatch) {
      await User.incrementLoginAttempts(user);
      return res
        .status(401)
        .json({ success: false, message: "Invalid username or password" });
    }

    if (!user.is_active) {
      return res
        .status(403)
        .json({ success: false, message: "Account deactivated" });
    }

    await User.resetLoginAttempts(user);

    const payload = { id: user.id, username: user.username, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await User.addRefreshToken(user.id, refreshToken);

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: User.toSafeObject(user),
        accessToken,
        refreshToken,
      },
    });
  } catch (err) {
    console.error("Login error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// POST /auth/register  (client registration only)
const register = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { username, password } = req.body;

    // Prevent registering with a username that belongs to any master
    const existingMaster = await Master.findOneByUsername(username);
    if (existingMaster) {
      return res
        .status(400)
        .json({ success: false, message: "Username not available" });
    }

    const exists = await User.findOneByUsername(username);
    if (exists) {
      return res
        .status(409)
        .json({ success: false, message: "Username already taken" });
    }

    const user = await User.create({ username, password, role: "client" });

    const payload = { id: user.id, username: user.username, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    await User.addRefreshToken(user.id, refreshToken);

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      data: {
        user: User.toSafeObject(user),
        accessToken,
        refreshToken,
      },
    });
  } catch (err) {
    console.error("Register error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// POST /auth/refresh
const refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res
        .status(400)
        .json({ success: false, message: "Refresh token required" });
    }

    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch {
      return res
        .status(401)
        .json({ success: false, message: "Invalid or expired refresh token" });
    }

    // Master refresh
    if (decoded.role === "master") {
      const master = await Master.findById(decoded.id);
      if (!master || !master.is_active) {
        return res
          .status(401)
          .json({ success: false, message: "Refresh token revoked" });
      }
      const payload = {
        id: master.id,
        username: master.username,
        displayName: master.display_name || master.username,
        role: "master",
      };
      const newAccessToken = generateAccessToken(payload);
      const newRefreshToken = generateRefreshToken(payload);
      return res.json({
        success: true,
        data: { accessToken: newAccessToken, refreshToken: newRefreshToken },
      });
    }

    // Client refresh
    const user = await User.findById(decoded.id, { withSensitive: true });
    if (!user || !user.is_active) {
      return res
        .status(401)
        .json({ success: false, message: "Refresh token revoked" });
    }
    const hasToken = await User.hasRefreshToken(user.id, refreshToken);
    if (!hasToken) {
      return res
        .status(401)
        .json({ success: false, message: "Refresh token revoked" });
    }

    const newRefreshToken = generateRefreshToken({
      id: user.id,
      username: user.username,
      role: user.role,
    });
    await User.rotateRefreshToken(user.id, refreshToken, newRefreshToken);

    const newAccessToken = generateAccessToken({
      id: user.id,
      username: user.username,
      role: user.role,
    });

    return res.json({
      success: true,
      data: { accessToken: newAccessToken, refreshToken: newRefreshToken },
    });
  } catch (err) {
    console.error("Refresh error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// POST /auth/logout
const logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (refreshToken) {
      let decoded;
      try {
        decoded = verifyRefreshToken(refreshToken);
        if (decoded.role !== "master") {
          const user = await User.findById(decoded.id, { withSensitive: true });
          if (user) {
            await User.removeRefreshToken(user.id, refreshToken);
          }
        }
      } catch {
        // Token invalid — still return success
      }
    }

    return res.json({ success: true, message: "Logged out successfully" });
  } catch (err) {
    console.error("Logout error:", err);
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /me
const me = async (req, res) => {
  try {
    if (req.user.role === "master") {
      const master = await Master.findById(req.user.id);
      if (!master || !master.is_active) {
        return res.status(401).json({ success: false, message: "Master not found" });
      }
      return res.json({
        success: true,
        data: { user: Master.toSafeObject(master) },
      });
    }
    return res.json({ success: true, data: { user: User.toSafeObject(req.user) } });
  } catch {
    res.status(500).json({ success: false, message: "Server error" });
  }
};

// GET /verify 
const verify = async (req, res) => {
  return res.json({
    success: true,
    data: {
      id: req.user._id || req.user.id,
      username: req.user.username,
      role: req.user.role,
    },
  });
};

export { login, register, refresh, logout, me, verify };