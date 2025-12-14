const express = require("express");
const path = require("path");
const fs = require("fs");
const convertPageToImage = require("../utils/pdfToImage");
const downloadPdfFromS3 = require("../utils/s3Download");

const router = express.Router();

router.get("/image", async (req, res) => {
  const { s3Key, pageNumber } = req.query;

  if (!s3Key || !pageNumber) {
    return res.status(400).json({ error: "Missing s3Key or pageNumber" });
  }

  try {
    // 1️⃣ Download PDF from S3
    const localPdfPath = await downloadPdfFromS3(s3Key);

    // 2️⃣ Convert page to image
    const outputDir = path.join(__dirname, "../temp");
    const imagePath = await convertPageToImage(
      localPdfPath,
      pageNumber,
      outputDir
    );

    // 3️⃣ Send image
    res.sendFile(imagePath);
  } catch (err) {
    console.error("Page image error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;