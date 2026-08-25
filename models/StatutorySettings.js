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
    sio_bahraini_employee_percent: { type: Number, min: 0 },
    sio_bahraini_employer_percent: { type: Number, min: 0 },
    sio_expat_employee_percent: { type: Number, min: 0 },
    sio_expat_employer_percent: { type: Number, min: 0 },
    sio_ceiling_fils: { type: Number, min: 0 },
    social_allowance_fils: { type: Number, min: 0 },

    // End of Service
    eos_first_three_years_percent: { type: Number, min: 0 },
    eos_thereafter_percent: { type: Number, min: 0 },
    eos_scheme_start_date: Date,

    // Overtime
    overtime_day_percent: { type: Number, min: 0 },
    overtime_night_percent: { type: Number, min: 0 },
    overtime_rest_day_percent: { type: Number, min: 0 },
    overtime_holiday_percent: { type: Number, min: 0 },
    overtime_weekly_cap_hours: { type: Number, min: 0 },

    // Leave
    annual_leave_days: { type: Number, min: 0 },
    sick_full_days: { type: Number, min: 0 },
    sick_half_days: { type: Number, min: 0 },
    sick_unpaid_days: { type: Number, min: 0 },
    maternity_paid_days: { type: Number, min: 0 },
    maternity_unpaid_days: { type: Number, min: 0 },
    paternity_days: { type: Number, min: 0 },
    bereavement_days: { type: Number, min: 0 },
    marriage_days: { type: Number, min: 0 },
    hajj_days: { type: Number, min: 0 },

    // Payroll Calendar
    payroll_cutoff_day: { type: Number, min: 0 },
    payroll_cutoff_time: { type: String, trim: true },
    payday: { type: Number, min: 0 },
    payslip_visible_hour: { type: String, trim: true },

    timezone: {
      type: String,
      default: "Asia/Bahrain",
      trim: true
    },

    // Attendance
    checkin_allowed_minutes_before: { type: Number, min: 0 },
    late_grace_minutes: { type: Number, min: 0 },
    early_exit_grace_minutes: { type: Number, min: 0 },
    checkout_allowed_minutes_after: { type: Number, min: 0 },
    half_day_hours_threshold: { type: Number, min: 0 },
    absent_hours_threshold: { type: Number, min: 0 },

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