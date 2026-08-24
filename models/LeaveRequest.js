    const mongoose = require("mongoose");

const leaveRequestSchema = new mongoose.Schema(
  {
    employeeID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    leaveType: {
      type: String,
      enum: ["annual", "sick", "unpaid", "other"],
      required: true,
    },

    startDate: {
      type: Date,
      required: true,
    },

    endDate: {
      type: Date,
      required: true,
    },

    reason: {
      type: String,
      trim: true,
    },

    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "cancelled"],
      default: "pending",
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },

    managerComment: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,
  }
);

const LeaveRequest = mongoose.model("LeaveRequest",leaveRequestSchema);

module.exports = LeaveRequest;