const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    tableName: {
      type: String,
      required: true
    },

    recordID: {
      type: String,
      required: true
    },

    action: {
      type: String,
      enum: [
        "create",
        "update",
        "approve",
        "cancel",
        "correct"
      ],
      required: true
    },

    changedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    changedAt: {
      type: Date,
      default: Date.now,
      required: true
    },

    fieldName: {
      type: String,
      required: true
    },

    oldValue: {
      type: String
    },

    newValue: {
      type: String
    },

    reason: {
      type: String
    },

    ipAddress: {
      type: String
    }
  }
);

module.exports = mongoose.model("AuditLog", auditLogSchema);