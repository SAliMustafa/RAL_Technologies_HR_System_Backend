const mongoose = require("mongoose");

const salaryStructureSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true
    },

    company_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true
    },

    currency: {
      type: String,
      default: "BHD",
      required: true,
      uppercase: true,
      trim: true
    },

    lines: [
      {
        salary_component_id: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "SalaryComponent",
          required: true
        },

        amount: {
          type: Number,
          min: 0
        },

        percent: {
          type: Number,
          min: 0,
          max: 100
        },
      }
    ],

    is_active: {
      type: Boolean,
      default: true
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "SalaryStructure",
  salaryStructureSchema
);