const mongoose = require("mongoose");

module.exports = mongoose.model("AuditLog", {
  userId: String,
  action: String,
  resource: String,
  ip: String,
  createdAt: { type: Date, default: Date.now }
});