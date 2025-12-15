const mongoose = require("mongoose");

const EditionSchema = new mongoose.Schema(
  {
    newspaperName: { type: String, required: true },
    editionDate: { type: String, required: true }, // YYYY-MM-DD
    s3Key: { type: String, required: true },
    pageCount: { type: Number, required: true },
    city: { type: String, default: null},
    editionType: { type: String, enum: ["REGULAR", "SPECIAL"], default: "REGULAR"},
    category: { type: String, default: null }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Edition", EditionSchema);