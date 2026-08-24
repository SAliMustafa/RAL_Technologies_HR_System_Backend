const mongoose = require("mongoose");

const payslipLineSchema = new mongoose.Schema(
  {
    payslipID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Payslip",
      required: true
    },

    componentID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SalaryComponent",
      required: true
    },

    amountFils: {
      type: Number,
      required: true
    },

    quantity: {
      type: Number
    },

    rate: {
      type: Number
    },

    note: {
      type: String
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "PayslipLine",
  payslipLineSchema
);