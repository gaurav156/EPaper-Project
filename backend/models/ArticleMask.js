const mongoose = require("mongoose");

// x, y, width, height are normalized values (0–1)
const ArticleMaskSchema = new mongoose.Schema(
  {
    editionId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Edition",
      required: true
    },
    pageNumber: { type: Number, required: true },

    x: Number,
    y: Number,
    width: Number,
    height: Number
  },
  { timestamps: true }
);

module.exports = mongoose.model("ArticleMask", ArticleMaskSchema);