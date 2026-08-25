const mongoose = require("mongoose");

const salaryComponentSchema = new mongoose.Schema(
  {
    component_name: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    component_type: {
      type: String,
      enum: ["earning", "deduction"],
      required: true
    },

    is_basic: {
      type: Boolean,
      required: true,
      default: false
    },

    is_cash: {
      type: Boolean,
      required: true,
      default: true
    },

    is_social_allowance: {
      type: Boolean,
      required: true,
      default: false
    },

    counts_for_sio: {
      type: Boolean,
      required: true,
      default: false
    },

    counts_for_eos: {
      type: Boolean,
      required: true,
      default: false
    },

    formula: {
      type: String,
      trim: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "SalaryComponent",
  salaryComponentSchema
);