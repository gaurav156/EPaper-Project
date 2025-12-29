const mongoose = require("mongoose");

module.exports = mongoose.model("AuditLog", {
  userId: String,
  action: String,
  resource: String,
  ip: String,
  userAgent: String,
  meta: Object,
  createdAt: { type: Date, default: Date.now }
});