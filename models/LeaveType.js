const mongoose = require("mongoose");

const leaveTypeSchema = new mongoose.Schema(
  {
    leave_type_name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    max_days_per_year: {
      type: Number,
      required: true
    },

    pay_fraction: {
      type: Number,
      required: true,
      min: 0,
      max: 1
    },

    requires_service_months: {
      type: Number,
      default: 0
    },

    requires_document: {
      type: Boolean,
      default: false
    },

    carry_forward: {
      type: Boolean,
      default: false
    },

    max_carry_forward: {
      type: Number
    },

    counts_toward_service: {
      type: Boolean,
      default: true
    },

    once_per_lifetime: {
      type: Boolean,
      default: false
    },

    includes_holidays: {
      type: Boolean,
      default: false
    },

    gender_restriction: {
      type: String,
      enum: ["maternity", "paternity"],
    },

    next_leave_type_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LeaveType"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("LeaveType", leaveTypeSchema);