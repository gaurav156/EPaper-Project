const express = require("express");
const path = require("path");
const fs = require("fs");
const cropArticle = require("../utils/cropArticle");
const downloadPdfFromS3 = require("../utils/s3Download");
const convertPageToImage = require("../utils/pdfToImage");
const getArticleCacheKey = require("../utils/articleCacheKey");

const router = express.Router();

router.post("/extract", async (req, res) => {
  const {
    s3Key,
    pageNumber,
    mask,
    newspaperName,
    editionDate
  } = req.body;

  try {
    // Download PDF
    const localPdf = await downloadPdfFromS3(s3Key);
    // Convert page to image
    const tempDir = path.join(
      __dirname,
      "../temp",
      s3Key.replace(/[^a-zA-Z0-9]/g, "_")
    );
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir, { recursive: true });

    // Page image (already cached)
    const pageImagePath = await convertPageToImage(
      localPdf,
      pageNumber,
      tempDir,
      { quality: "high" }
    );

    // Article cache key
    const cacheKey = getArticleCacheKey({
      s3Key,
      pageNumber,
      mask
    });

    const footerText = `${newspaperName} | ${editionDate} | Page ${pageNumber}`;

    const articleImagePath = await cropArticle({
      pageImagePath,
      mask,
      footerText,
      outputDir: tempDir,
      cacheKey
    });

    res.sendFile(articleImagePath);
  } catch (err) {
    console.error("Article extract error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;