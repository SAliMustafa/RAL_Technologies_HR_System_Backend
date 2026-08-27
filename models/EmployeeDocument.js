const mongoose = require("mongoose");

const EXPIRING_DOC_TYPES = [
  'CPR',
  'passport',
  'work_permit',
  'visa',
  'health_insurance'  
]

const  employeeDocumentSchema = new mongoose.Schema(
  {
    employee_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      required: true
    },

    document_type: {
      type: String,
      enum: [
        "CPR",
        "passport",
        "work_permit",
        "visa",
        "employment_contract",
        "qualification",
        "health_insurance",
        "bank_letter"
      ],
      required: true
    },

   
    issue_date: {
      type: Date
    },

    expiry_date: {
      type: Date,
      validate: {
        validator: function(v){
          return !EXPIRING_DOC_TYPES.includes(this.document_type) || v != null
        },
        message: 'expiry_date is required for expiring document types (CPR, passport, visa, work permit, health insurance).'
      }
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

    uploaded_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    verified_by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User"
    },

    verified_on: {
      type: Date
    },

    rejection_reason: {
      type: String,
      trim: true,
      validate: {
        validator: function(v){
          return this.status !== 'rejected' || (v != null && v.trim() !== '')
        },
        message: 'rejection_reason is required when document status is "rejected".'
      }
    }
    ,
    is_active:{
      type:Boolean,
      default:true
    }

  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "EmployeeDocument",
  employeeDocumentSchema
);