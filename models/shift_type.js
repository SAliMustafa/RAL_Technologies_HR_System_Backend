const mongoose = require("mongoose");

const shiftTypeSchema = new mongoose.Schema(
  {
    shiftName: {
      type: String,
      required: true
    },

    startTime: {
      type: String,
      required: true
    },

    endTime: {
      type: String,
      required: true
    },

    breakMinutes: {
      type: Number,
      default: 60
    },

    workingDays: {
      type: [String],
      required: true
    },

    checkinAllowedMinutesBefore: {
      type: Number,
      default: 60
    },

    lateGraceMinutes: {
      type: Number,
      default: 15
    },

    earlyExitGraceMinutes: {
      type: Number,
      default: 15
    },

    checkoutAllowedMinutesAfter: {
      type: Number,
      default: 60
    },

    halfDayHoursThreshold: {
      type: Number,
      default: 4
    },

    absentHoursThreshold: {
      type: Number,
      default: 2
    },

    markLateEntry: {
      type: Boolean,
      default: true
    },

    markEarlyExit: {
      type: Boolean,
      default: true
    },

    allowOvertime: {
      type: Boolean,
      default: true
    },

    holidayListID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HolidayList",
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("ShiftType", shiftTypeSchema);