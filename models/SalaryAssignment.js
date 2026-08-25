const mongoose = require("mongoose");

const salaryAssignmentSchema = new mongoose.Schema(
  {
    employee_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true
    },

    salary_structure_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "SalaryStructure",
      required: true
    },

    from_date: {
      type: Date,
      required: true
    },

    base_amount_fils: {
      type: Number,
      required: true,
      min: 0
    }
  },
  { timestamps: true }
);

salaryAssignmentSchema.index({employee_id: 1, from_date: 1}, {unique: true})

module.exports = mongoose.model(
  "SalaryAssignment",
  salaryAssignmentSchema
);