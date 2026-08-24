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

    clockIn: {
      type: Date,
      default: null,
    },

    clockOut: {
      type: Date,
      default: null,
    },

    attendanceStatus: {
      type: String,
      enum: [
        "present",
        "late",
        "absent",
        "missing",
        "leave",
      ],
      default: "present",
    },

    approvalStatus: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null,
    },
  },
  {
    timestamps: true,
  }
);



const Attendance = mongoose.model("Attendance",attendanceSchema);

module.exports = Attendance;