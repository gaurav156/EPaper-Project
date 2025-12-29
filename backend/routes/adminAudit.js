const express = require("express");
const requireAdmin = require("../middleware/requireAdmin");
const AuditLog = require("../models/AuditLog");

const router = express.Router();

router.get("/", requireAdmin, async (req, res) => {
  const { action, from, to } = req.query;

  const filter = {};
  if (action) filter.action = action;
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = new Date(to);
  }

  const logs = await AuditLog
    .find(filter)
    .sort({ createdAt: -1 })
    .limit(200);

  res.json(logs);
});

module.exports = router;