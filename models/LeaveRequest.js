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
      required: true,
      min: 0.5
    },

    reason: {
      type: String,
      trim: true,
      maxlength: 1000
    },

    document: {
      type: String,
      trim: true,
      maxlength: 2000
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
      type: String,
      trim: true,
      maxlength: 1000
    }
  },
  { timestamps: true }
);

leaveRequestSchema.index({
  employee_id: 1, createdAt: -1
})
leaveRequestSchema.index({
  approver_id: 1, status: 1, createdAt: -1
})
leaveRequestSchema.index({
  employee_id: 1, from_date: 1, to_date: 1
})


module.exports = mongoose.model(
  "LeaveRequest",
  leaveRequestSchema
);