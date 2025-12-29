const express = require("express");
const requireAdmin = require("../middleware/requireAdmin");
const ViewMetric = require("../models/ViewMetric");

const router = express.Router();

router.get("/summary", requireAdmin, async (req, res) => {
  const pages = await ViewMetric.countDocuments({ type: "PAGE" });
  const articles = await ViewMetric.countDocuments({ type: "ARTICLE" });

  res.json({ pages, articles });
});

module.exports = router;