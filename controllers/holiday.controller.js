const Holiday = require('../models/Holiday')

async function createHoliday(req, res) {
    try {

        const { date, description, is_confirmed } = req.body

        if (!date || !description) {
            return res.status(400).json({
                message: 'date and description are required.'
            })
        }

        const holiday = await Holiday.create({ date, description, is_confirmed })

        return res.status(201).json(holiday)
    }
    catch (err) {
        console.log(err)

        if (err.name === "ValidationError") {
            return res.status(400).json({ message: err.message })
        }

        if (err.code === 11000) {
            return res.status(409).json({
                message: 'A holiday already exists on this date.'
            })
        }

        return res.status(500).json({ message: 'Internal Server Error' })
    }
}

async function getHolidays(req, res) {
    try {
        const { from_date, to_date } = req.query
        const filter = {}

        if (from_date || to_date) {
            filter.date = {}
            if (from_date) filter.date.$gte = new Date(from_date)
            if (to_date) filter.date.$lte = new Date(to_date)
        }

        const holidays = await Holiday.find(filter).sort({ date: 1 })
        return res.status(200).json(holidays)

    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ message: "Internal Server Error" });
    }
}