const mongoose = require("mongoose");

const payslipSchema = new mongoose.Schema(
  {
    payrollRunID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "PayrollRun",
      required: true
    },

    employeeID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true
    },

    workingDays: {
      type: Number,
      required: true
    },

    paidDays: {
      type: Number,
      required: true
    },

    absentDays: {
      type: Number,
      required: true
    },

    unpaidLeaveDays: {
      type: Number,
      required: true
    },

    grossFils: {
      type: Number,
      required: true
    },

    totalDeductionsFils: {
      type: Number,
      required: true
    },

    netFils: {
      type: Number,
      required: true
    },

    sioEmployeeFils: {
      type: Number,
      required: true
    },

    sioEmployerFils: {
      type: Number,
      required: true
    },

    eosAccrualFils: {
      type: Number,
      default: 0
    },

    status: {
      type: String,
      enum: ["draft", "approved", "paid", "cancelled"],
      default: "draft",
      required: true
    }
  },
  { timestamps: true }
);



module.exports = mongoose.model("Payslip", payslipSchema);