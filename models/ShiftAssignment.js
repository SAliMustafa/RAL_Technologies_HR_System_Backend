const mongoose = require("mongoose");

const shiftAssignmentSchema = new mongoose.Schema(
  {
    employee_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Employee',
        required: true
    },
    shift_type_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'ShiftType',
        required: true
    },
    from_date: {
        type: Date,
        required: true
    },
    to_date: {
        type: Date
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("ShiftAssignment", shiftAssignmentSchema);