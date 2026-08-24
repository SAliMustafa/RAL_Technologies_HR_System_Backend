const mongoose = require("mongoose");

const leaveRequestSchema = new mongoose.Schema(
  {
    employeeID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true
    },

    leaveTypeID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LeaveType",
      required: true
    },

    fromDate: {
      type: Date,
      required: true
    },

    toDate: {
      type: Date,
      required: true
    },

    isHalfDay: {
      type: Boolean,
      default: false
    },

    halfDayDate: {
      type: Date
    },

    totalDays: {
      type: Number,
      required: true
    },

    reason: {
      type: String
    },

    document: {
      type: String
    },

    approverID: {
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

    balanceAtRequest: {
      type: Number
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "LeaveRequest",
  leaveRequestSchema
);