const mongoose = require("mongoose");

const statutorySettingsSchema = new mongoose.Schema(
  {
  

    // Social Insurance
    sioBahrainiEmployeePercent: Number,
    sioBahrainiEmployerPercent: Number,
    sioExpatEmployeePercent: Number,
    sioExpatEmployerPercent: Number,
    sioCeilingFils: Number,
    socialAllowanceFils: Number,

    // End of Service
    eosFirstThreeYearsPercent: Number,
    eosThereafterPercent: Number,
    eosSchemeStartDate: Date,

    // Overtime
    overtimeDayPercent: Number,
    overtimeNightPercent: Number,
    overtimeRestDayPercent: Number,
    overtimeHolidayPercent: Number,
    overtimeWeeklyCapHours: Number,

    // Leave
    annualLeaveDays: Number,
    sickFullDays: Number,
    sickHalfDays: Number,
    sickUnpaidDays: Number,
    maternityPaidDays: Number,
    maternityUnpaidDays: Number,
    paternityDays: Number,
    bereavementDays: Number,
    marriageDays: Number,
    hajjDays: Number,

    // Payroll Calendar
    payrollCutoffDay: Number,
    payrollCutoffTime: String,
    payday: Number,
    payslipVisibleHour: String,

    timezone: {
      type: String,
      default: "Asia/Bahrain"
    },

    // Attendance
    checkinAllowedMinutesBefore: Number,
    lateGraceMinutes: Number,
    earlyExitGraceMinutes: Number,
    checkoutAllowedMinutesAfter: Number,
    halfDayHoursThreshold: Number,
    absentHoursThreshold: Number,

    managerMayEditAttendance: {
      type: Boolean,
      default: false
    },

    // Documents
    documentAlertDays: {
      type: [Number],
      default: [90, 30, 7]
    },

    employeeMayUpload: {
      type: Boolean,
      default: true
    },

    // Privacy
    allowBiometricAttendance: {
      type: Boolean,
      default: false
    },

    allowDataOutsideBahrain: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model(
  "StatutorySettings",
  statutorySettingsSchema
);