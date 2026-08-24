const mongoose = require("mongoose");

const holidaySchema = new mongoose.Schema(
  {
    holidayListID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HolidayList",
      required: true
    },

    date: {
      type: Date,
      required: true
    },

    description: {
      type: String,
      required: true
    },

    isConfirmed: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Holiday", holidaySchema);