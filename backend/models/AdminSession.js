const mongoose = require("mongoose");

const AdminSessionSchema = new mongoose.Schema({
  userId: mongoose.Schema.Types.ObjectId,
  ip: String,
  userAgent: String,
  lastSeenAt: Date,
  expiresAt: Date
});

module.exports = mongoose.model("AdminSession", AdminSessionSchema);