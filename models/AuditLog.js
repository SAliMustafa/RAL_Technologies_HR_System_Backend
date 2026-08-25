const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
  {
    table_name: {
      type: String,
      required: true,
      trim: true
    },

    record_id: {
      type: String,
      required: true,
      trim: true
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

    changed_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    changed_at: {
      type: Date,
      default: Date.now,
      required: true
    },

    field_name: {
      type: String,
      required: true,
      trim: true
    },

    old_value: {
      type: String
    },

    new_value: {
      type: String
    },

    reason: {
      type: String,
      trim: true
    },

    ip_address: {
      type: String,
      trim: true
    }
  }
);

auditLogSchema.index({table_name: 1, record_id: 1})
auditLogSchema.index({changed_at: -1})

module.exports = mongoose.model("AuditLog", auditLogSchema);