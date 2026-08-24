const mongoose = require("mongoose");

const employeeDocumentSchema = new mongoose.Schema(
  {
    employeeID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true
    },

    documentType: {
      type: String,
      enum: [
        "CPR",
        "passport",
        "work-permit",
        "visa",
        "employment-contract",
        "qualification",
        "health-insurance",
        "bank-letter"
      ],
      required: true
    },

    documentNumber: {
      type: String
    },

    issueDate: {
      type: Date
    },

    expiryDate: {
      type: Date
    },

    file: {
      type: String,
      required: true
    },

    status: {
      type: String,
      enum: ["pending", "verified", "rejected"],
      default: "pending",
      required: true
    },

    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    verifiedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    verifiedOn: {
      type: Date
    },

    rejectionReason: {
      type: String
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "EmployeeDocument",
  employeeDocumentSchema
);