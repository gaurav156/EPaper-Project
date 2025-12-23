const express = require("express");
const path = require("path");
const fs = require("fs");
const convertPageToImage = require("../utils/pdfToImage");
const downloadPdfFromS3 = require("../utils/s3Download");

const router = express.Router();

router.get("/image", async (req, res) => {
  const { s3Key, pageNumber } = req.query;
  const quality = req.query.quality || "high";
  const dpi = quality === "low" ? 72 : 200;
  const scale = quality === "low" ? 0.4 : 1;

  if (!s3Key || !pageNumber) {
    return res.status(400).json({ error: "Missing s3Key or pageNumber" });
  }

  try {
    // Download PDF from S3
    const localPdfPath = await downloadPdfFromS3(s3Key);

    // Convert page to image
    const editionTempDir = path.join(
      __dirname,
      "../temp",
      s3Key.replace(/[^a-zA-Z0-9]/g, "_")
    );

    if (!fs.existsSync(editionTempDir)) {
      fs.mkdirSync(editionTempDir, { recursive: true });
    }

    const imagePath = await convertPageToImage(
      localPdfPath,
      pageNumber,
      editionTempDir
    );

    res.setHeader("Cache-Control", "no-store");

    // Send image
    res.sendFile(imagePath);
  } catch (err) {
    console.error("Page image error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;