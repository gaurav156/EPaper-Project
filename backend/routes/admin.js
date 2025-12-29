const express = require("express");
const path = require("path");
const getImageCacheStats = require("../utils/imageCacheStats");
const requireAdmin = require("../middleware/requireAdmin");
const AdminSession = require("../models/AdminSession");
const AuditLog = require("../models/AuditLog");

const router = express.Router();

router.get("/cache-stats", requireAdmin, (req, res) => {
  const cacheDir = path.join(__dirname, "../temp");
  const stats = getImageCacheStats(cacheDir);
  res.json(stats);
});

router.get("/sessions", requireAdmin, async (req, res) => {
  const sessions = await AdminSession.find()
    .sort({ lastSeenAt: -1 })
    .limit(50)
    .lean();

  res.json(
    sessions.map(s => ({
      ...s,
      status: s.revokedAt
        ? "REVOKED"
        : s.expiresAt < Date.now()
        ? "EXPIRED"
        : "ACTIVE"
    }))
  );
});

router.delete("/sessions/:id", requireAdmin, async (req, res) => {
  const session = await AdminSession.findById(req.params.id);
  if (!session) return res.sendStatus(404);

  session.revokedAt = new Date();
  await session.save();

  await AuditLog.create({
    userId: req.user.id,
    action: "ADMIN_SESSION_REVOKED",
    resource: "SESSION",
    metadata: {
      sessionId: session._id,
      targetUserId: session.userId
    },
    ip: req.ip
  });

  res.json({ success: true });
});

module.exports = router;