// models/AuditLog.js
const mongoose = require("mongoose");

const AuditLogSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    index: true
  },

  action: {
    type: String,
    required: true,
    index: true
  },

  resource: {
    type: String,
    required: true,
    index: true
  },

  metadata: {
    type: mongoose.Schema.Types.Mixed
  },

  ip: {
    type: String
  },

  geo: {
    type: String
  },

  userAgent: {
    type: String
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("AuditLog", AuditLogSchema);