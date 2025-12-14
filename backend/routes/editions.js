const express = require("express");
const Edition = require("../models/Edition");

const router = express.Router();

// List all editions
router.get("/", async (req, res) => {
  const editions = await Edition.find().sort({ editionDate: -1 });
  res.json(editions);
});

// Get single edition
router.get("/:id", async (req, res) => {
  const edition = await Edition.findById(req.params.id);
  res.json(edition);
});

module.exports = router;