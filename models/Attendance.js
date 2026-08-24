const mongoose = require("mongoose");

const attendanceSchema = new mongoose.Schema(
  {
    employee_id: {
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
        "half_day",
        "on_leave",
        "holiday",
        "weekly_off",
      ],
      required: true,
    },

    shift_type_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ShiftType",
    },

    in_time: {
      type: Date,
    },

    out_time: {
      type: Date,
    },

    worked_hours: {
      type: Number,
      default: 0,
    },

    is_late_entry: {
      type: Boolean,
      default: false,
    },

    is_early_exit: {
      type: Boolean,
      default: false,
    },

    is_incomplete: {
      type: Boolean,
      default: false,
    },

    overtime_hours: {
      type: Number,
      default: 0,
      min: 0,
    },

    overtime_approved: {
      type: Boolean,
      default: false,
    },

    leave_request_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LeaveRequest",
      default: null,
    },

    is_corrected: {
      type: Boolean,
      default: false,
    },

    corrected_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },

    correction_reason: {
      type: String,
      trim: true,
      validate: {
        validator: function(v){
          return !this.is_corrected || (v != null && v.trim() !== '')
        },
        message: 'correction_reason is required when attendance is corrected.'
      }
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

attendanceSchema.index({ employee_id: 1, date: 1}, {unique: true})

const Attendance = mongoose.model(
  "Attendance",
  attendanceSchema
);

module.exports = Attendance;