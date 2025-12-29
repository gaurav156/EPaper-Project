const express = require("express");
const path = require("path");
const fs = require("fs");
const cropArticle = require("../utils/cropArticle");
const downloadPdfFromS3 = require("../utils/s3Download");
const { convertPageToImage, maybeConvertToWebp} = require("../utils/pdfToImage");
const getArticleCacheKey = require("../utils/articleCacheKey");
const ViewMetric = require("../models/ViewMetric");

const router = express.Router();

router.post("/extract", async (req, res) => {
  const {
    s3Key,
    pageNumber,
    mask,
    newspaperName,
    editionDate,
    editionId
  } = req.body;

  const format = req.query.format || "png";

  if (!s3Key || !pageNumber || !mask) {
    return res.status(400).json({ error: "Missing parameters" });
  }

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

    let pageImagePath = await convertPageToImage(
      localPdf,
      pageNumber,
      tempDir,
      { quality: "high" }
    );

    if (format === "webp") {
      pageImagePath = await maybeConvertToWebp(pageImagePath);
    }

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

    // Article metric only after success
    if (editionId) {
      ViewMetric.create({
        type: "ARTICLE",
        editionId,
        pageNumber,
        articleKey: cacheKey
      }).catch(() => {});
    }

    res.sendFile(articleImagePath);

  } catch (err) {
    console.error("Article extract error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;