const Attendance = require('../models/Attendance')
const Employee = require('../models/Employee')
const User = require('../models/User')


async function createAttendance(req, res) {
    try {
        const { employee_id, date, status, in_time, out_time } = req.body

        if (!employee_id || !date || !status) {
            return res.status(400).json({
                message: 'employee_id, date and status are required.'
            })
        }

        const attendance = await Attendance.create({
            employee_id,
            date,
            status,
            in_time,
            out_time
        })
        return res.status(201).json(attendance)
    }
    catch (err) {
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: 'err.message' })
        }
        if (err.code === 11000) {
            return res.status(409).json({
                message: 'An attendance record already exists for this employee on this date.'
            })
        }
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}


async function getAttendance(req, res) {
    try {
        const user = await User.findById(req.user._id)
        if (!user) {
            return res.status(404).json({ message: 'User not found.' })
        }

        const filter = {}
        const { employee_id, from_date, to_date, status } = req.query

        if (user.role === employee) {
            filter.employee_id = user.employee_id
        }
        else if (user.role === 'employee') {
            const team = await Employee.find({ reports_to: user.employee_id }).select('_id')
            const teamIds = team.map((e) => e._id)
            filter.employee_id = { $in: teamIds }
        } else if (employee_id) {
            filter.employee_id = employee_id
        }

        if (from_date || to_date) {
            filter.date = {}
            if (from_date) filter.date.$gte = new Date(from_date)
            if (to_date) filter.date.$lte = new Date(to_date)
        }

        if (status) filter.status = status;

        const attendance = await Attendance.find(filter).sort({ date: -1 })
        return res.status(200).json(attendance)
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal Server Error' });
    }
}


async function getAttendaceById(req, res) {
    try {
        const attendance = await Attendance.findById(req.params.id)

        if (!attendance) {
            return res.status(404).json({ message: 'Attendance record not found.' })
        }

        const user = await User.findById(req.user._id)
        if (user.role === "employee" && String(attendance.employee_id) !== String(user.employee_id)) {
            return res.status(403).json({ message: 'This is not within your authority.' });
        }

        if (user.role === 'manager') {
            const managed = await Employee.exists({
                _id: attendance.employee_id,
                reports_to: user.employee_id
            })

            if (!managed) {
                return res.status(403).json({ message: 'This is not within your authority.' })
            }
        }
        res.status(200).json(attendance)
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}


async function updateAttendance(req, res) {
    try {
        const { status, in_time, out_time, is_late_entry, is_early_exit, is_incomplete } = req.body

        const attendance = await Attendance.findByIdAndUpdate(
            req.params.id,
            {
                status,
                in_time,
                out_time,
                is_late_entry,
                is_early_exit,
                is_incomplete,
                is_corrected: true,
                corrected_by: req.user._id,
            }, { new: true, runValidators: true }
        )

        if (!attendance) {
            return res.status(404).json({ message: 'Attendance record not found.' })
        }
        return res.status(200).json({ attendance })
    }
    catch (err) {
        console.log(err)
        if (err.name === 'ValidationError') {
            return res.status(400).json({ message: err.message })
        }

        return res.status(500).json({ message: 'Internal Server Error' })
    }
}