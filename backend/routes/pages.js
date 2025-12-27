const express = require("express");
const path = require("path");
const fs = require("fs");
const { convertPageToImage, maybeConvertToWebp } = require("../utils/pdfToImage");
const downloadPdfFromS3 = require("../utils/s3Download");
const cleanupImageCache = require("../utils/cleanupImageCache");

const router = express.Router();

router.get("/image", async (req, res) => {
  const { s3Key, pageNumber, quality = "high" } = req.query;
  const format = req.query.format || "png";

  if (!s3Key || !pageNumber) {
    return res.status(400).json({ error: "Missing s3Key or pageNumber" });
  }

  try {
    const localPdfPath = await downloadPdfFromS3(s3Key);

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
      editionTempDir,
      { quality }
    );

    if (format === "webp") {
      imagePath = await maybeConvertToWebp(imagePath);
    }

    res.setHeader(
      "Cache-Control",
      "public, max-age=31536000, immutable"
    );

    res.setHeader("Vary", "Accept");

    res.sendFile(imagePath);
  } catch (err) {
    console.error("Page image error:", err);
    res.status(500).json({ error: err.message });
  } finally {
    try {
      cleanupImageCache(path.join(__dirname, "../temp"));
    } catch (err) {
      console.error("Error while cleaning image cache:", err);
    }
  }
});

module.exports = router;