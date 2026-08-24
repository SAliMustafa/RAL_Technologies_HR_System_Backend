const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    employeeID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true,
    },

    date: {
      type: Date,
      required: true,
    },

    status: {
      type: String,
      enum: [
        "present",
        "absent",
        "half-day",
        "on-leave",
        "holiday",
        "weekly-off",
      ],
      required: true,
    },

    shiftTypeID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ShiftType",
    },

    inTime: {
      type: Date,
    },

    outTime: {
      type: Date,
    },

    workedHours: {
      type: Number,
      default: 0,
    },

    isLateEntry: {
      type: Boolean,
      default: false,
    },

    isEarlyExit: {
      type: Boolean,
      default: false,
    },

    isIncomplete: {
      type: Boolean,
      default: false,
    },

    overtimeHours: {
      type: Number,
      default: 0,
      min: 0,
    },

    overtimeApproved: {
      type: Boolean,
      default: false,
    },

    leaveRequestID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LeaveRequest",
      default: null,
    },

    isCorrected: {
      type: Boolean,
      default: false,
    },

    correctedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    correctionReason: {
      type: String,
    },

    locked: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);



const Attendance = mongoose.model(
  "Attendance",
  attendanceSchema
);

module.exports = Attendance;