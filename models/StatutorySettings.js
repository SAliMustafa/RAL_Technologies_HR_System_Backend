const mongoose = require("mongoose");

const statutorySettingsSchema = new mongoose.Schema(
  {
    company_id: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Company",
      required: true,
      unique: true
    },

    // Social Insurance
    sio_bahraini_employee_percent: {
      type: Number,
      default: 8,
      min: 8
    },
    sio_bahraini_employer_percent: {
      type: Number,
      default: 18,
      min: 18
    },   
  sio_expat_employee_percent: {
      type: Number,
      default: 1,
      min: 1
    },  
 sio_expat_employer_percent: {
      type: Number,
      default: 3,
      min: 3
    },
   sio_ceiling_fils: { type: Number, min: 0 },
    social_allowance_fils: { type: Number, min: 0 },
    // End of Service
    eos_first_three_years_percent: {
      type: Number,
      default: 4.2,
      min: 4.2
    },   
 eos_thereafter_percent: {
      type: Number,
      default: 8.4,
      min: 8.4
    },
        eos_scheme_start_date: Date,

    // Overtime
     overtime_day_percent: {
      type: Number,
      default: 125,
      min: 125
    },

    overtime_night_percent: {
      type: Number,
      default: 150,
      min: 150
    },

    overtime_rest_day_percent: {
      type: Number,
      default: 150,
      min: 150
    },

    overtime_holiday_percent: {
      type: Number,
      default: 150,
      min: 150
    },

    overtime_weekly_cap_hours: {
      type: Number,
      default: 12,
      min: 0,
      max: 12
    },

    // Leave
    annual_leave_days: {
      type: Number,
      default: 30,
      min: 30
    },

    sick_full_days: {
      type: Number,
      default: 15,
      min: 15
    },

    sick_half_days: {
      type: Number,
      default: 20,
      min: 20
    },

    sick_unpaid_days: {
      type: Number,
      default: 20,
      min: 20
    },

    maternity_paid_days: {
      type: Number,
      default: 60,
      min: 60
    },

    maternity_unpaid_days: {
      type: Number,
      default: 15,
      min: 15
    },

    paternity_days: {
      type: Number,
      default: 1,
      min: 1
    },

    bereavement_days: {
      type: Number,
      default: 3,
      min: 3
    },

    marriage_days: {
      type: Number,
      default: 3,
      min: 3
    },

    hajj_days: {
      type: Number,
      default: 14,
      min: 14
    },


    // Payroll Calendar
    
    payroll_cutoff_day: {
      type: Number,
      default: 25,
      min: 1,
      max: 31
    },

    payroll_cutoff_time: {
      type: String,
      default: "17:00",
      trim: true,
      match: /^([01]\d|2[0-3]):[0-5]\d$/
    },

    payday: {
      type: Number,
      default: 27,
      min: 1,
      max: 31
    },

    payslip_visible_hour: {
      type: String,
      default: "09:00",
      trim: true,
      match: /^([01]\d|2[0-3]):[0-5]\d$/
    },

    timezone: {
      type: String,
      default: "Asia/Bahrain",
      trim: true
    },

    // Attendance
    checkin_allowed_minutes_before: {
      type: Number,
      default: 60,
      min: 0
    },

    late_grace_minutes: {
      type: Number,
      default: 15,
      min: 0
    },

    early_exit_grace_minutes: {
      type: Number,
      default: 15,
      min: 0
    },

    checkout_allowed_minutes_after: {
      type: Number,
      default: 60,
      min: 0
    },

    half_day_hours_threshold: {
      type: Number,
      default: 4,
      min: 0
    },

    absent_hours_threshold: {
      type: Number,
      default: 2,
      min: 0
    },


    manager_may_edit_attendance: {
      type: Boolean,
      default: false
    },

    // Documents
    document_alert_days: {
      type: [Number],
      default: [90, 30, 7]
    },

    employee_may_upload: {
      type: Boolean,
      default: true
    },

    // Privacy
    allow_biometric_attendance: {
      type: Boolean,
      default: false
    },

    allow_data_outside_bahrain: {
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