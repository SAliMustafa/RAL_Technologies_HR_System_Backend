const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    role: {
        type: String,
        enum: ['Employee', 'Manager', 'HR Admin']
    }
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    managerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    jobTitle: {
        type: String
    },
    department: {
        type: String
    },
    status: {
        type: Boolean
    },
    leaveBalance: {
        type: Number
    }
  },
  { timestamps: true },
);


const Employee = mongoose.model("Employee", employeeSchema);

module.exports = Employee;
