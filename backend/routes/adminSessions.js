const express = require("express");
const requireAdmin = require("../middleware/requireAdmin");
const AdminSession = require("../models/AdminSession");

const router = express.Router();

router.get("/", requireAdmin, async (req, res) => {
  const sessions = await AdminSession.find({
    userId: req.user.id
  });
  res.json(sessions);
});

router.delete("/:id", requireAdmin, async (req, res) => {
  await AdminSession.deleteOne({
    _id: req.params.id,
    userId: req.user.id
  });

  await User.findByIdAndUpdate(req.user.id, {
    refreshTokenHash: null
  });

  res.json({ success: true });
});

module.exports = router;