const mongoose = require("mongoose");

module.exports = mongoose.model("ViewMetric", {
  type: { type: String, enum: ["PAGE", "ARTICLE"], required: true },
  editionId: { type: mongoose.Schema.Types.ObjectId, ref: "Edition" },
  pageNumber: Number,
  articleKey: String,
  createdAt: { type: Date, default: Date.now }
});