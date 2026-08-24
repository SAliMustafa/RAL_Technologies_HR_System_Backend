const mongoose = require("mongoose");

const holidayListSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    companyID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company"
    },

    year: {
      type: Number,
      required: true
    },

    weeklyOffDays: {
      type: [String],
      required: true,
      default: ["Friday", "Saturday"]
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "HolidayList",
  holidayListSchema
);