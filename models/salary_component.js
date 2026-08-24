const mongoose = require("mongoose");

const salaryComponentSchema = new mongoose.Schema(
  {
    componentName: {
      type: String,
      required: true,
      unique: true
    },

    componentType: {
      type: String,
      enum: ["earning", "deduction"],
      required: true
    },

    isBasic: {
      type: Boolean,
      required: true
    },

    isCash: {
      type: Boolean,
      required: true
    },

    isSocialAllowance: {
      type: Boolean,
      required: true
    },

    countsForSIO: {
      type: Boolean,
      required: true
    },

    countsForEOS: {
      type: Boolean,
      required: true
    },

    formula: {
      type: String
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "SalaryComponent",
  salaryComponentSchema
);