const Holiday = require('../models/Holiday')
const { logCreate, logUpdate } = require('../utils/auditLog')

async function createHoliday(req, res) {
    try {
        const { from_date, to_date, description, is_confirmed } = req.body

        if (!from_date || !to_date || !description) {
            return res.status(400).json({
                message: 'from_date, to_date and description are required.'
            })
        }

        const holiday = await Holiday.create({ from_date, to_date, description, is_confirmed })

        logCreate({
            tableName: "holiday",
            recordId: holiday._id,
            userId: req.user._id,
            data: { from_date, to_date, description, is_confirmed },
            ipAddress: req.ip
        })

        return res.status(201).json(holiday)
    }
    catch (err) {
        console.log(err)
        if (err.name === "ValidationError") {
            return res.status(400).json({ message: err.message })
        }
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}

async function getHolidays(req, res) {
    try {
        const holidays = await Holiday.find().sort({ from_date: 1 })
        return res.status(200).json(holidays)
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}

async function getHolidayById(req, res) {
    try {
        const holiday = await Holiday.findById(req.params.id)

        if (!holiday) {
            return res.status(404).json({ message: 'Holiday not found.' })
        }

        return res.status(200).json(holiday)
    }
    catch (err) {
        console.log(err);
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}

async function updateHoliday(req, res) {
    try {
        const before = await Holiday.findById(req.params.id).lean()
        if (!before) {
            return res.status(404).json({ message: 'Holiday not found.' })
        }

        const { from_date, to_date, description, is_confirmed } = req.body

        const holiday = await Holiday.findByIdAndUpdate(
            req.params.id,
            { from_date, to_date, description, is_confirmed },
            { new: true, runValidators: true }
        )

        logUpdate({
            tableName: "holiday",
            recordId: holiday._id,
            userId: req.user._id,
            before,
            after: { from_date, to_date, description, is_confirmed },
            ipAddress: req.ip
        })

        return res.status(200).json(holiday)
    }
    catch (err) {
        console.log(err)
        if (err.name === "ValidationError") {
            return res.status(400).json({ message: err.message })
        }
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}

async function deleteHoliday(req, res) {
    try {
        const holiday = await Holiday.findByIdAndDelete(req.params.id)

        if (!holiday) {
            return res.status(404).json({ message: 'Holiday not found.' })
        }
        return res.status(200).json({ message: 'Holiday deleted' })
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}

module.exports = {
    createHoliday,
    getHolidays,
    getHolidayById,
    updateHoliday,
    deleteHoliday
}