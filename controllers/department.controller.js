const Department = require('../models/Department')

async function createDepartment(req, res) {
    try {
        const { company_id, name, manager_id } = req.body

        if (!company_id || !name) {
            return res.status(400).json({
                message: 'company_id and name are required.'
            })
        }

        const department = await Department.create({
            company_id,
            name,
            manager_id,
        })

        return res.status(201).json(department)
    }


    catch (err) {
        console.log(err)
        if (err.name === "ValidationError") {
            return res.status(400).json({ message: err.message })
        }
        if (err.code === 11000) {
            return res.status(409).json({
                message: 'A department with this name already exists for this company.'
            })
        }
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}

async function getDepartment(req, res) {
    try {
        const { company_id } = req.query
        const filter = company_id ? { company_id } : {}

        const departments = await Department.find(filter).sort({ name: 1 })
        return res.status(200).json(departments)
    }

    catch (err) {
        console.log(err)
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}
