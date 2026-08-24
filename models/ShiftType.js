const mongoose = require("mongoose");

const shiftTypeSchema = new mongoose.Schema(
  {
    shift_name: {
      type: String,
      required: true,
      default: 'General',
      trim: true
    },

    start_time: {
      type: String,
      required: true,
      default: '08:00'
    },

    end_time: {
      type: String,
      required: true,
      default: '17:00'

    },

    break_minutes: {
      type: Number,
      default: 60
    },

    working_days: {
      type: [String],
      required: true,
      default: ["Sun", "Mon", "Tue", "Wed", "Thu"]
    },

    checkin_allowed_minutes_before: {
      type: Number,
      default: 60
    },

    late_grace_minutes: {
      type: Number,
      default: 15
    },

    early_exit_grace_minutes: {
      type: Number,
      default: 15
    },

    checkout_allowed_minutes_after: {
      type: Number,
      default: 60
    },

    half_day_hours_threshold: {
      type: Number,
      default: 4
    },

    absent_hours_threshold: {
      type: Number,
      default: 2
    },

    mark_late_entry: {
      type: Boolean,
      default: true
    },

    mark_early_exit: {
      type: Boolean,
      default: true
    },

    allow_overtime: {
      type: Boolean,
      default: true
    },

    holiday_list_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HolidayList",
      required: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("ShiftType", shiftTypeSchema);