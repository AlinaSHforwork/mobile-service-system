const { validationResult } = require("express-validator");
const User = require("../models/User");
const {
  generateAccessToken,
  generateRefreshToken,
  verifyRefreshToken,
} = require("../utils/jwt");

// Helper to check master credentials
const isMasterCredentials = (username, password) => {
  return (
    username === process.env.MASTER_USERNAME &&
    password === process.env.MASTER_PASSWORD
  );
};

// POST /auth/login
const login = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success: false, errors: errors.array() });
    }

    const { username, password } = req.body;

    // --- Master login (hardcoded credentials, no DB) ---
    if (isMasterCredentials(username, password)) {
      const masterPayload = {
        id: "master",
        username: "Master",
        role: "master",
      };
      const accessToken = generateAccessToken(masterPayload);
      const refreshToken = generateRefreshToken(masterPayload);

      return res.status(200).json({
        success: true,
        message: "Master login successful",
        data: {
          user: { id: "master", username: "Master", role: "master" },
          accessToken,
          refreshToken,
        },
      });
    }

    // --- Client login ---
    const user = await User.findOne({ username }).select(
      "+password +loginAttempts +lockUntil +refreshTokens",
    );

    if (!user) {
      // Prevent username enumeration - same error for wrong user or password
      return res
        .status(401)
        .json({ success: false, message: "Invalid username or password" });
    }

    if (user.isLocked()) {
      const lockRemaining = Math.ceil(
        (user.lockUntil - Date.now()) / 1000 / 60,
      );
      return res.status(423).json({
        success: false,
        message: `Account locked. Try again in ${lockRemaining} minute(s).`,
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      await user.incrementLoginAttempts();
      return res
        .status(401)
        .json({ success: false, message: "Invalid username or password" });
    }

    if (!user.isActive) {
      return res
        .status(403)
        .json({ success: false, message: "Account deactivated" });
    }

    await user.resetLoginAttempts();

    const payload = { id: user._id, username: user.username, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    // Store refresh token (keep max 5 sessions)
    user.refreshTokens = [
      ...(user.refreshTokens || []).slice(-4),
      refreshToken,
    ];
    await user.save();

    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        user: user.toSafeObject(),
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

    // Prevent registering as Master username
    if (
      username.toLowerCase() ===
      (process.env.MASTER_USERNAME || "master").toLowerCase()
    ) {
      return res
        .status(400)
        .json({ success: false, message: "Username not available" });
    }

    const exists = await User.findOne({ username });
    if (exists) {
      return res
        .status(409)
        .json({ success: false, message: "Username already taken" });
    }

    const user = await User.create({ username, password, role: "client" });

    const payload = { id: user._id, username: user.username, role: user.role };
    const accessToken = generateAccessToken(payload);
    const refreshToken = generateRefreshToken(payload);

    user.refreshTokens = [refreshToken];
    await user.save();

    return res.status(201).json({
      success: true,
      message: "Registration successful",
      data: {
        user: user.toSafeObject(),
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

    // Master refresh (no DB check)
    if (decoded.id === "master") {
      const payload = { id: "master", username: "Master", role: "master" };
      const newAccessToken = generateAccessToken(payload);
      return res.json({ success: true, data: { accessToken: newAccessToken } });
    }

    const user = await User.findById(decoded.id).select(
      "+refreshTokens +isActive",
    );
    if (!user || !user.isActive || !user.refreshTokens.includes(refreshToken)) {
      return res
        .status(401)
        .json({ success: false, message: "Refresh token revoked" });
    }

    // Rotate refresh token
    const newRefreshToken = generateRefreshToken({
      id: user._id,
      username: user.username,
      role: user.role,
    });
    user.refreshTokens = user.refreshTokens.filter((t) => t !== refreshToken);
    user.refreshTokens.push(newRefreshToken);
    await user.save();

    const newAccessToken = generateAccessToken({
      id: user._id,
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
        if (decoded.id !== "master") {
          const user = await User.findById(decoded.id).select("+refreshTokens");
          if (user) {
            user.refreshTokens = user.refreshTokens.filter(
              (t) => t !== refreshToken,
            );
            await user.save();
          }
        }
      } catch {
        // Token invalid - still return success
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
      return res.json({
        success: true,
        data: { user: { id: "master", username: "Master", role: "master" } },
      });
    }
    return res.json({ success: true, data: { user: req.user.toSafeObject() } });
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

module.exports = { login, register, refresh, logout, me, verify };
