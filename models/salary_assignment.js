const mongoose = require("mongoose");

const salaryAssignmentSchema = new mongoose.Schema(
  {
    employeeID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true
    },

    salaryStructureID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SalaryStructure",
      required: true
    },

    fromDate: {
      type: Date,
      required: true
    },

    baseAmountFils: {
      type: Number,
      required: true,
      min: 0
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "SalaryAssignment",
  salaryAssignmentSchema
);