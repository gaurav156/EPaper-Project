const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const AdminSession = require("../models/AdminSession");
const AuditLog = require("../models/AuditLog");
const requireAdmin = require("../middleware/requireAdmin");
const {
  signAccessToken,
  signRefreshToken,
  hashToken
} = require("../utils/token");

const router = express.Router();

/**
 * ADMIN REGISTER (one-time or protected later)
 */
router.post("/register-admin", async (req, res) => {
  try {
    const { name, email, password } = req.body;

    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "Admin already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    user = new User({
      name,
      email,
      password: hashedPassword,
      isAdmin: true
    });

    await user.save();

    res.json({ message: "Admin created successfully ✅" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * LOGIN (Admin only)
 */
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user || !user.isAdmin) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    if (user.lockUntil && user.lockUntil > Date.now()) {
      return res.status(423).json({
        message: "Account locked. Try later."
      });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      user.failedLoginAttempts++;
      if (user.failedLoginAttempts >= 5) {
        user.lockUntil = Date.now() + 15 * 60 * 1000;
      }
      await user.save();
      return res.status(401).json({ message: "Invalid credentials" });
    }

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    user.refreshTokenHash = hashToken(refreshToken);
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    await user.save();

    await AdminSession.create({
      userId: user._id,
      ip: req.ip,
      userAgent: req.headers["user-agent"],
      lastSeenAt: new Date(),
      expiresAt: Date.now() + 7*24*60*60*1000
    });

    await AuditLog.create({
      userId: user._id,
      action: "ADMIN_LOGIN_SUCCESS",
      ip: req.ip,
      userAgent: req.headers["user-agent"]
    });

    const isProd = process.env.NODE_ENV === "production";

    // Cookies
    res
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "strict" : "lax",
        maxAge: 15 * 60 * 1000
      })
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "strict" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000
      })
      .json({ success: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post("/refresh", async (req, res) => {
  const token = req.cookies.refreshToken;
  if (!token) return res.sendStatus(401);

  try {
    const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
    const user = await User.findById(payload.id);

    if (!user) return res.sendStatus(403);

    // Rotation check
    if (hashToken(token) !== user.refreshTokenHash) {
      user.refreshTokenHash = null;
      await user.save();
      return res.sendStatus(403);
    }

    const newAccess = signAccessToken(user);
    const newRefresh = signRefreshToken(user);

    user.refreshTokenHash = hashToken(newRefresh);
    await user.save();

    res
      .cookie("accessToken", newAccess, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 15 * 60 * 1000
      })
      .cookie("refreshToken", newRefresh, {
        httpOnly: true,
        secure: true,
        sameSite: "strict",
        maxAge: 7 * 24 * 60 * 60 * 1000
      })
      .json({ success: true });

  } catch {
    res.sendStatus(403);
  }
});

router.post("/logout", async (req, res) => {
  const token = req.cookies.refreshToken;
  if (token) {
    try {
      const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);
      await User.findByIdAndUpdate(payload.id, {
        refreshTokenHash: null
      });
    } catch {}
  }

  res
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json({ success: true });
});

router.get("/me", requireAdmin, (req, res) => {
  res.json({ ok: true });
});

module.exports = router;