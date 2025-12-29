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
const UAParser = require("ua-parser-js");
const geoip = require("geoip-lite");

const router = express.Router();

function parseUA(ua) {
  const p = new UAParser(ua).getResult();
  return `${p.browser.name} ${p.browser.version} · ${p.os.name}`;
}

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
    const geo = geoip.lookup(req.ip);

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

        await AuditLog.create({
          userId: user._id,
          action: "ADMIN_ACCOUNT_LOCKED",
          resource: "AUTH",
          ip: req.ip,
          userAgent: parseUA(req.headers["user-agent"]),
          metadata: {
            lockUntil: user.lockUntil
          }
        });
      }
      await user.save();

      await AuditLog.create({
        userId: user?._id,
        action: "ADMIN_LOGIN_FAILED",
        resource: "AUTH",
        ip: req.ip,
        geo: geo ? `${geo.city}, ${geo.country}` : "Unknown",
        userAgent: parseUA(req.headers["user-agent"]),
        metadata: {
          reason: "INVALID_PASSWORD"
        }
      });

      return res.status(401).json({ message: "Invalid credentials" });
    }

    const refreshToken = signRefreshToken(user);

    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    await user.save();

    const session = await AdminSession.create({
      userId: user._id,
      refreshTokenHash: hashToken(refreshToken),
      ip: req.ip,
      userAgent: parseUA(req.headers["user-agent"]),
      lastSeenAt: new Date(),
      expiresAt: Date.now() + 7*24*60*60*1000
    });

    const accessToken = signAccessToken(user, session._id);

    await AuditLog.create({
      userId: user._id,
      action: "ADMIN_LOGIN_SUCCESS",
      resource: "AUTH",
      ip: req.ip,
      geo: geo ? `${geo.city}, ${geo.country}` : "Unknown",
      userAgent: parseUA(req.headers["user-agent"]),
      metadata: {
        sessionId: session._id
      }
    });

    const isProd = process.env.NODE_ENV === "production";

    // Cookies
    res
      .cookie("accessToken", accessToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
        maxAge: 15 * 60 * 1000
      })
      .cookie("refreshToken", refreshToken, {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? "none" : "lax",
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

    const session = await AdminSession.findById(payload.sid);
    if (!session || session.revokedAt) return res.sendStatus(403);

    if (hashToken(token) !== session.refreshTokenHash) {
      session.revokedAt = new Date();
      await session.save();
      return res.sendStatus(403);
    }

    const user = await User.findById(session.userId);
    if (!user) return res.sendStatus(403);

    const newRefresh = signRefreshToken(user, session._id);
    session.refreshTokenHash = hashToken(newRefresh);
    session.lastSeenAt = new Date();
    await session.save();

    const newAccess = signAccessToken(user, session._id);

    res
      .cookie("accessToken", newAccess, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 15 * 60 * 1000
      })
      .cookie("refreshToken", newRefresh, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000
      })
      .json({ success: true });

  } catch {
    res.sendStatus(403);
  }
});

router.post("/logout", requireAdmin, async (req, res) => {
  const token = req.cookies.refreshToken;

  if (token) {
    try {
      const payload = jwt.verify(token, process.env.JWT_REFRESH_SECRET);

      await User.findByIdAndUpdate(payload.id, {
        refreshTokenHash: null
      });

      await AuditLog.create({
        userId: payload.id,
        action: "ADMIN_LOGOUT",
        resource: "AUTH",
        ip: req.ip,
        userAgent: parseUA(req.headers["user-agent"]),
        metadata: {
          reason: "USER_INITIATED"
        }
      });
    } catch {}
  }

  res
    .clearCookie("accessToken")
    .clearCookie("refreshToken")
    .json({ success: true });
});

router.get("/me", requireAdmin, (req, res) => {
  res.json({
    userId: req.user.id,
    sessionId: req.user.sid
  });
});

module.exports = router;