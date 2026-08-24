const mongoose = require("mongoose");

const salaryStructureSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    companyID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true
    },

    currency: {
      type: String,
      default: "BHD",
      required: true
    },

    lines: [
      {
        salaryComponentID: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "SalaryComponent",
          required: true
        },

        amount: Number,

        percent: Number
      }
    ],

    isActive: {
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