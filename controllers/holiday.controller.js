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

        return res.status(500).json({message: 'Internal Server Error'})
    }
}