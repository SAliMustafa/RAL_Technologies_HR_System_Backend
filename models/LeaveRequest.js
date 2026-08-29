const mongoose = require("mongoose");

const leaveRequestSchema = new mongoose.Schema(
  {
    employee_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true
    },

    leave_type_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LeaveType",
      required: true
    },

    from_date: {
      type: Date,
      required: true
    },

    to_date: {
      type: Date,
      required: true
    },

    is_half_day: {
      type: Boolean,
      default: false
    },

    half_day_date: {
      type: Date
    },

    total_days: {
      type: Number,
      required: true
    },

    reason: {
      type: String
    },

    document: {
      type: String
    },

    approver_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true
    },

    status: {
      type: String,
      enum: [
        "draft",
        "pending",
        "approved",
        "rejected",
        "cancelled"
      ],
      default: "draft",
      required: true
    },

    balance_at_request: {
      type: Number
    },

    decision_note: {
      type: String
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "LeaveRequest",
  leaveRequestSchema
);