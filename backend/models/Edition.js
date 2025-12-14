const mongoose = require("mongoose");

const EditionSchema = new mongoose.Schema(
  {
    newspaperName: { type: String, required: true },
    editionDate: { type: String, required: true }, // YYYY-MM-DD
    s3Key: { type: String, required: true },
    pageCount: { type: Number, required: true }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Edition", EditionSchema);