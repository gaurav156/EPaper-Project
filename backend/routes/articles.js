const express = require("express");
const path = require("path");
const fs = require("fs");
const cropArticle = require("../utils/cropArticle");
const downloadPdfFromS3 = require("../utils/s3Download");
const convertPageToImage = require("../utils/pdfToImage");

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
    // 1️⃣ Download PDF
    const localPdf = await downloadPdfFromS3(s3Key);

    // 2️⃣ Convert page to image
    const tempDir = path.join(__dirname, "../temp");
    if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

    const pageImagePath = await convertPageToImage(
      localPdf,
      pageNumber,
      tempDir
    );

    // 3️⃣ Crop article
    const footerText = `${newspaperName} | ${editionDate} | Page ${pageNumber}`;

    const articleImagePath = await cropArticle({
      pageImagePath,
      mask,
      footerText,
      outputDir: tempDir
    });

    res.sendFile(articleImagePath);
  } catch (err) {
    console.error("Article extract error:", err);
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;