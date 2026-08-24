const mongoose = require("mongoose");

const payrollRunSchema = new mongoose.Schema(
  {
    companyID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true
    },

    periodStart: {
      type: Date,
      required: true
    },

    periodEnd: {
      type: Date,
      required: true
    },

    status: {
      type: String,
      enum: [
        "draft",
        "calculated",
        "approved",
        "paid",
        "cancelled"
      ],
      default: "draft",
      required: true
    },

    cutoffAt: {
      type: Date,
      required: true
    },

    approvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    approvedAt: {
      type: Date
    },

    payslipsVisibleFrom: {
      type: Date,
      required: true
    },

    totalGrossFils: {
      type: Number,
      default: 0
    },

    totalDeductionsFils: {
      type: Number,
      default: 0
    },

    totalNetFils: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);


module.exports = mongoose.model(
  "PayrollRun",
  payrollRunSchema
);