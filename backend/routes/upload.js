const express = require("express");
const multer = require("multer");
const s3 = require("../utils/s3");

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
      ContentType: file.mimetype,
    };

    const result = await s3.upload(params).promise();

    res.json({
      message: "File uploaded successfully ✅",
      fileUrl: result.Location,
      key: result.Key,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

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