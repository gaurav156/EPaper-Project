const mongoose = require("mongoose");

// x, y, width, height are normalized values (0–1)
const ArticleMaskSchema = new mongoose.Schema(
  {
    editionDate: { type: String, required: true },
    pageNumber: { type: Number, required: true },

    x: Number,
    y: Number,
    width: Number,
    height: Number,

    s3Key: String
  },
  { timestamps: true }
);

module.exports = mongoose.model("ArticleMask", ArticleMaskSchema);