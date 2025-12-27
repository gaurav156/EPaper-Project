const express = require("express");
const path = require("path");
const getImageCacheStats = require("../utils/imageCacheStats");
const requireAdmin = require("../middleware/requireAdmin");

const router = express.Router();

router.get("/cache-stats", requireAdmin, (req, res) => {
  const cacheDir = path.join(__dirname, "../temp");
  const stats = getImageCacheStats(cacheDir);
  res.json(stats);
});

module.exports = router;