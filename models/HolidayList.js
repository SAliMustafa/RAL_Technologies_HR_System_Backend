const mongoose = require("mongoose");

const holidayListSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    company_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company"
    },

    year: {
      type: Number,
      required: true
    },

    weekly_off_days: {
      type: [String],
      required: true,
      enum: [
        'sunday',
        'monday',
        'tuesday',
        'wednesday',
        'thursday',
        'friday',
        'saturday'
      ],
      default: ["friday", "saturday"]
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "HolidayList",
  holidayListSchema
);