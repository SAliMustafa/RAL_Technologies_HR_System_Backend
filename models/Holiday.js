const mongoose = require("mongoose");

const holidaySchema = new mongoose.Schema(
  {
    from_date: {
      type: Date,
      required: true,
    },

    to_date: {
      type: Date,
      required: true,
      validate: {
        validator: function (value) {
          return value >= this.from_date;
        },
        message: "to_date cannot be before from_date.",
      },
    },

    description: {
      type: String,
      required: true,
      trim: true,
    },

    is_confirmed: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

holidaySchema.virtual("days").get(function () {
  const oneDayMs = 24 * 60 * 60 * 1000;
  return Math.round((this.to_date - this.from_date) / oneDayMs) + 1;
});

module.exports = mongoose.model("Holiday", holidaySchema);