const express = require("express");
const ArticleMask = require("../models/ArticleMask");
const requireAdmin = require("../middleware/requireAdmin");

const router = express.Router();

// Save mask
router.post("/", requireAdmin, async (req, res) => {
  try {
    const mask = new ArticleMask(req.body);
    await mask.save();
    res.json(mask);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get masks for a page
router.get("/", async (req, res) => {
  const query = {
    editionDate: req.query.editionDate,
    pageNumber: Number(req.query.pageNumber)
  };

  if (req.query.s3Key) {
    query.s3Key = req.query.s3Key;
  }

  const masks = await ArticleMask.find(query);
  res.json(masks);
});

router.delete("/:id", requireAdmin, async (req, res) => {
  await ArticleMask.findByIdAndDelete(req.params.id);
  res.json({ message: "Mask deleted" });
});

module.exports = router;