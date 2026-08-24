const mongoose = require("mongoose");

const checkinSchema = new mongoose.Schema(
  {
    employeeID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true
    },

    timestamp: {
      type: Date,
      required: true
    },

    logType: {
      type: String,
      enum: ["IN", "OUT"],
      required: true
    },

    source: {
      type: String,
      enum: ["mobile-app", "web", "biometric-device", "hr-entry"],
      required: true
    },

    deviceID: {
      type: String
    },

    latitude: {
      type: Number
    },

    longitude: {
      type: Number
    },

    attendanceID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Attendance"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Checkin", checkinSchema);