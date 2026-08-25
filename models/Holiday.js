const mongoose = require("mongoose");

const holidaySchema = new mongoose.Schema(
  {
    holiday_list_id: {
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
      required: true,
      trim: true
    },

    is_confirmed: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

holidaySchema.index({holiday_list_id: 1, date: 1}, {unique: true})

module.exports = mongoose.model("Holiday", holidaySchema);