const mongoose = require("mongoose");

const leaveTypeSchema = new mongoose.Schema(
  {
    leaveTypeName: {
      type: String,
      required: true,
      unique: true
    },

    maxDaysPerYear: {
      type: Number,
      required: true
    },

    payFraction: {
      type: Number,
      required: true,
      min: 0,
      max: 1
    },

    requiresServiceMonths: {
      type: Number,
      default: 0
    },

    requiresDocument: {
      type: Boolean,
      default: false
    },

    carryForward: {
      type: Boolean,
      default: false
    },

    maxCarryForward: {
      type: Number
    },

    encashable: {
      type: Boolean,
      default: false
    },

    countsTowardService: {
      type: Boolean,
      default: true
    },

    oncePerLifetime: {
      type: Boolean,
      default: false
    },

    includesHolidays: {
      type: Boolean,
      default: false
    },

    genderRestriction: {
      type: String,
      enum: ["Maternity", "paternity"],
      default: "none"
    },

    nextLeaveTypeID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "LeaveType"
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("LeaveType", leaveTypeSchema);