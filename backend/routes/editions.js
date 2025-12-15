const express = require("express");
const Edition = require("../models/Edition");

const router = express.Router();

/**
 * GET edition by s3Key (Viewer use)
 */
router.get("/by-key", async (req, res) => {
  try {
    const { s3Key } = req.query;
    const edition = await Edition.findOne({ s3Key });
    if (!edition) {
      return res.status(404).json({ message: "Edition not found" });
    }
    res.json(edition);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * GET all editions
 */
router.get("/", async (req, res) => {
  const editions = await Edition.find().sort({ editionDate: -1 });
  res.json(editions);
});

/**
 * GET edition by ID
 */
router.get("/:id", async (req, res) => {
  try {
    const edition = await Edition.findById(req.params.id);
    if (!edition) return res.status(404).json({ message: "Not found" });
    res.json(edition);
  } catch (err) {
    res.status(400).json({ message: "Invalid ID" });
  }
});

module.exports = router;