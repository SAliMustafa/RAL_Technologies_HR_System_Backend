const AttendanceCorrection = require('../models/AttendanceCorrection')
const Attendance = require('../models/Attendance')
const Employee = require('../models/Employee')
const User = require('../models/User')
const { logCreate, logUpdate } = require('../utils/auditLog')

async function createCorrectionRequest(req, res) {
    try {
        const { employee_id, date, reason, requested_in_time, requested_out_time, requested_status } = req.body

        if (!employee_id || !date || !reason) {
            return res.status(400).json({ message: 'employee_id, date and reason are required.' })
        }

        const user = await User.findById(req.user._id)

        const managed = await Employee.exists({
            _id: employee_id,
            reports_to: user.employee_id
        })

        if (!managed) {
            return res.status(403).json({
                message: 'You can only request corrections for your own team.'
            })
        }

        const correction = await AttendanceCorrection.create({
            employee_id,
            date,
            requested_by: req.user._id,
            reason,
            requested_in_time,
            requested_out_time,
            requested_status
        })

        logCreate({
            tableName: 'attendance_correction',
            recordId: correction._id,
            userId: req.user._id,
            data: { employee_id, date, reason, requested_in_time, requested_out_time, requested_status },
            ipAddress: req.ip
        })

        return res.status(201).json(correction)
    }
    catch (err) {
        console.log(err)
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: err.message })
        }
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}


async function getCorrectionRequests(req, res) {
    try {
        const user = await User.findById(req.user._id)
        const filter = {}
        const { status } = req.query

        if (user.role === 'manager') {
            filter.requested_by = req.user._id
        }
        else if (user.role === 'employee') {
            filter.employee_id = user.employee_id
        }

        if (status) filter.status = status

        const corrections = await AttendanceCorrection.find(filter).sort({ requested_at: -1 })
        return res.status(200).json(corrections)
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}


async function getCorrectionById(req, res) {
    try {
        const correction = await AttendanceCorrection.findById(req.params.id)

        if (!correction) {
            res.status(404).json({ message: 'Correction request not found.' })
        }
        return res.status(200).json(correction)
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}


async function correctByHr(req, res) {
    try {
        const correction = await AttendanceCorrection.findById(req.params.id)

        if (!correction) {
            return res.status(404).json({ message: 'Correction request not found.' })
        }

        if (correction.status !== 'requested') {
            return res.status(400).json({
                message: `Cannot correct a request in "${correction.status}" status.`
            })
        }


        await Attendance.findOneAndUpdate(
            { employee_id: correction.employee_id, date: correction.date },
            {
                employee_id: correction.employee_id,
                date: correction.date,
                status: correction.requested_status,
                in_time: correction.requested_in_time,
                out_time: correction.requested_out_time,
                is_corrected: true,
                corrected_by: req.user._id,
                correction_reason: correction.reason,
            },
            { new: true, upsert: true, runValidators: true, setDefaultsOnInsert: true }
        )

        logUpdate({
            tableName: 'attendance',
            recordId: correction._id,
            userId: req.user._id,
            before: beforeAttendance || {},
            after: {
                status: correction.requested_status,
                in_time: correction.requested_in_time,
                out_time: correction.requested_out_time,
            },
            reason: correction.reason,
            ipAddress: req.ip
        })

        correction.status = "corrected_by_hr"
        correction.corrected_by = req.user._id
        correction.corrected_at = new Date()
        await correction.save()

        logUpdate({
            tableName: 'attendance_correction',
            recordId: correction._id,
            userId: req.user._id,
            before: beforeCorrection,
            after: { status: correction.status, corrected_by: correction.corrected_by, corrected_at: correction.corrected_at },
            ipAddress: req.ip,
        })

        return res.status(200).json(correction)
    }

    catch (err) {
        console.log(err)
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: err.message })
        }
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}


async function approveCorrection(req, res) {
    try {
        const correction = await AttendanceCorrection.findById(req.params.id)

        if (!correction) {
            return res.status(404).json(({ message: 'Correction request not found.' }))
        }

        if (correction.status !== 'corrected_by_hr') {
            return res.status(400).json({ message: `Cannot approve a request in "${correction.status}" status.` })
        }

        if (String(correction.requested_by) !== String(req.user._id)) {
            return res.status(403).json({
                message: 'Only the manager who requested this correction can approve it.'
            })
        }

        correction.status = "approved"
        correction.approved_by = req.user._id
        correction.approved_at = new Date()
        await correction.save()

        return res.status(200).json(correction)
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}


async function rejectCorrection(req, res) {
    try {
        const correction = await AttendanceCorrection.findById(req.params.id)

        if (!correction) {
            return res.status(404).json({ message: 'Correction request not found.' })
        }

        if (correction.status === 'approved' || correction.status === 'rejected') {
            return res.status(400).json({
                message: `Cannot reject a request in "${correction.status}" status.`
            })
        }

        correction.status = 'rejected'
        correction.rejected_at = new Date()
        await correction.save()

        return res.status(200).json(correction)
    }

    catch (err) {
        console.log(err)
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}

module.exports = {
    createCorrectionRequest,
    getCorrectionRequests,
    getCorrectionById,
    correctByHr,
    approveCorrection,
    rejectCorrection,
}