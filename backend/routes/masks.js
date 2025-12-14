const express = require("express");
const ArticleMask = require("../models/ArticleMask");

const router = express.Router();

// Save mask
router.post("/", async (req, res) => {
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
  const { editionDate, pageNumber } = req.query;

  const masks = await ArticleMask.find({
    editionDate,
    pageNumber
  });

  res.json(masks);
});

router.delete("/:id", async (req, res) => {
  await ArticleMask.findByIdAndDelete(req.params.id);
  res.json({ message: "Mask deleted" });
});

module.exports = router;