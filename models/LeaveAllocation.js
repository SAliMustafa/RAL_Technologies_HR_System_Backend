const mongoose = require("mongoose");

const leaveAllocationSchema = new mongoose.Schema(
  {
    employee_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Employee",
        required: true
    },
    leave_type_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'LeaveType',
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
    days_allocated: {
        type: Number,
        required: true,
        min: 0
    },
    days_carried_forward: {
        type: Number,
        default: 0,
        min: 0
    },
    days_taken: {
        type: Number,
        default: 0,
        min: 0
    }
  },
  { timestamps: true }
);

leaveAllocationSchema.index(
    {employee_id: 1, leave_type_id: 1, period_start: 1},
    {unique: true}
)

module.exports = mongoose.model("LeaveAllocation", leaveAllocationSchema);