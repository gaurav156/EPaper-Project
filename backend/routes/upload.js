const express = require("express");
const multer = require("multer");
const s3 = require("../utils/s3");
const Edition = require("../models/Edition");

const router = express.Router();

// Store file in memory
const storage = multer.memoryStorage();
const upload = multer({ storage });

// Upload PDF/Image
router.post("/", upload.single("file"), async (req, res) => {
  try {
    const file = req.file;

    if (!file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const fileKey = `newspapers/${Date.now()}_${file.originalname}`;

    const params = {
      Bucket: process.env.AWS_BUCKET_NAME,
      Key: fileKey,
      Body: file.buffer,
      ContentType: file.mimetype
    };

    const result = await s3.upload(params).promise();

    const edition = new Edition({
      newspaperName: req.body.newspaperName || "MyNews English",
      editionDate: req.body.editionDate || "2025-12-14",
      s3Key: result.Key,
      pageCount: req.body.pageCount || 8
    });

    await edition.save();

    res.json({
      message: "Upload successful ✅",
      fileUrl: result.Location,
      key: result.Key,
      edition
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Signed URL
router.get("/signed-url", async (req, res) => {
  const { key } = req.query;

  const params = {
    Bucket: process.env.AWS_BUCKET_NAME,
    Key: key,
    Expires: 60 * 5, // 5 minutes
  };

  const url = s3.getSignedUrl("getObject", params);
  res.json({ url });
});

module.exports = router;