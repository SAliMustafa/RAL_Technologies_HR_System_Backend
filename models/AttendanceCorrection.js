const mongoose = require("mongoose")

const attendanceCorrectionSchema = new mongoose.Schema(
    {
        employee_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Employee',
            required: true
        },
        date: {
            type: Date,
            required: true
        },
        requested_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true
        },
        reason: {
            type: String,
            required: true,
            trim: true
        },
        requested_in_time: {
            type: Date
        },
        requested_out_time: {
            type: Date
        },   
        requested_status: {
            type: String,
            enum: [
                "present",
                "absent",
                "half_day",
                "on_leave",
                "holiday",
                "weekly_off"
            ]
        },
        status: {
            type: String,
            enum: ['requested', 'corrected_by_hr', 'approved', 'rejected'],
            default: 'requested',
            required: true
        },
        corrected_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        approved_by: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },

    },{timestamps: true})

    const AttendanceCorrection = mongoose.model('AttendanceCorrection', attendanceCorrectionSchema)
    module.exports = AttendanceCorrection