const mongoose = require("mongoose");

const payrollRunSchema = new mongoose.Schema(
  {
    company_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true
    },

    period_start: {
      type: Date,
      required: true
    },

    period_end: {
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

    cutoff_at: {
      type: Date,
      required: true
    },

    approved_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    approved_at: {
      type: Date
    },

    payslips_visible_from: {
      type: Date,
      required: true
    },

    total_gross_fils: {
      type: Number,
      default: 0,
      min: 0
    },

    total_deductions_fils: {
      type: Number,
      default: 0,
      min: 0
    },

    total_net_fils: {
      type: Number,
      default: 0
    }
  },
  { timestamps: true }
);

payrollRunSchema.index({company_id: 1, period_start: 1, period_end: 1}, {unique: true})

module.exports = mongoose.model(
  "PayrollRun",
  payrollRunSchema
);