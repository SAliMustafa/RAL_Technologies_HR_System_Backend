const mongoose = require("mongoose");

const employeeSchema = new mongoose.Schema(
  {
    employeeCode: {
      type: String,
      required: true,
      unique: true,
      trim: true
    },

    nameEn: {
      type: String,
      required: true,
      trim: true
    },

    nameAr: {
      type: String,
      required: true,
      trim: true
    },

    cprNumber: {
      type: String,
      required: true,
      unique: true,
      match: /^\d{9}$/
    },

    dateOfBirth: {
      type: Date,
      required: true
    },

    gender: {
      type: String,
      enum: ["male", "female"],
      required: true
    },

    nationality: {
      type: String,
      required: true
    },

    isBahraini: {
      type: Boolean,
      required: true
    },

    workerCategory: {
      type: String,
      enum: ["bahraini", "gcc-national", "expatriate"],
      required: true
    },

    companyID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true
    },

    departmentID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Department"
    },

    designationID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Designation"
    },

    reportsTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Employee",
      default: null
    },

    dateOfJoining: {
      type: Date,
      required: true
    },

    probationEndDate: {
      type: Date
    },

    employmentType: {
      type: String,
      enum: ["full-time", "part-time", "fixed-term"],
      required: true
    },

    status: {
      type: String,
      enum: ["active", "on-leave", "suspended", "left"],
      default: "active",
      required: true
    },

    dateOfLeaving: {
      type: Date
    },

    iban: {
      type: String,
      required: true,
      trim: true
    },

    bankName: {
      type: String,
      required: true
      , trim: true,
      minlength: 22,
      maxlength: 22,
    },

    mobile: {
      type: String,
      required: true,
      match: /^3\d{7}$/
    },

    emailPersonal: {
      type: String
    },

    emailWork: {
      type: String
    },

    holidayListID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "HolidayList",
      required: true
    },

    shiftTypeID: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ShiftType"
    }
  },
  { timestamps: true }
);


const Employee = mongoose.model("Employee", employeeSchema);

module.exports = Employee;
