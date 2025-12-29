const mongoose = require("mongoose");

const AdminSessionSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, required: true },
  refreshTokenHash: { type: String, required: true },
  ip: String,
  geo: String,
  userAgent: String,
  lastSeenAt: Date,
  expiresAt: Date,
  revokedAt: {
    type: Date,
    default: null
  }
});

module.exports = mongoose.model("AdminSession", AdminSessionSchema);