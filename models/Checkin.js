const mongoose = require("mongoose");

const checkinSchema = new mongoose.Schema(
  {
    employee_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true
    },

    timestamp: {
      type: Date,
      required: true
    },

    log_type: {
      type: String,
      enum: ["IN", "OUT"],
      required: true
    },

    source: {
      type: String,
      enum: ["mobile_app", "web", "biometric_device", "hr_entry"],
      required: true
    },


    attendance_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Attendance"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Checkin", checkinSchema);