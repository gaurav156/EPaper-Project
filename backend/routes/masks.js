const express = require("express");
const ArticleMask = require("../models/ArticleMask");
const requireAdmin = require("../middleware/requireAdmin");

const router = express.Router();

// Save mask
router.post("/", requireAdmin, async (req, res) => {
  try {
    const {
      editionId,
      pageNumber,
      x,
      y,
      width,
      height,
      s3Key
    } = req.body;

    const mask = await ArticleMask.create({
      editionId,
      pageNumber,
      x,
      y,
      width,
      height,
      s3Key
    });


    res.json(mask);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Get masks for a page
router.get("/", async (req, res) => {
  const { editionId, pageNumber } = req.query;

  const masks = await ArticleMask.find({
    editionId,
    pageNumber
  });

  res.json(masks);
});

router.delete("/:id", requireAdmin, async (req, res) => {
  await ArticleMask.findByIdAndDelete(req.params.id);
  res.json({ message: "Mask deleted" });
});

// Update mask (resize)
router.patch("/:id", requireAdmin, async (req, res) => {
  const { x, y, width, height } = req.body;

  const mask = await ArticleMask.findByIdAndUpdate(
    req.params.id,
    { x, y, width, height },
    { new: true }
  );

  res.json(mask);
});

module.exports = router;