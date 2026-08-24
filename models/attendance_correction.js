const mongoose = require("mongoose");

const attendanceCorrectionSchema = new mongoose.Schema(
  {
    employeeID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true
    },

    date: {
      type: Date,
      required: true
    },

    requestedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    reason: {
      type: String,
      required: true
    },

    requestedInTime: {
      type: Date
    },

    requestedOutTime: {
      type: Date
    },

    requestedStatus: {
      type: String
    },

    status: {
      type: String,
      enum: [
        "requested",
        "corrected-by-hr",
        "approved",
        "rejected"
      ],
      default: "requested",
      required: true
    },

    correctedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    correctedAt: Date,
    approvedAt: Date,
    rejectedAt: Date
  },
  { timestamps: true }
);


const AttendanceCorrection = mongoose.model(
  "AttendanceCorrection",
  attendanceCorrectionSchema
);

module.exports = AttendanceCorrection;