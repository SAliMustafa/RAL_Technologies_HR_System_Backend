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


async function getDepartmentById(req,res){
    try{
        const department = await Department.findById(req.res.id)

        if (!department){
            return res.status(404).json({message: 'Department Not Found.'})
        }
        return res.status(200).json(department)
    }
    catch(err){
        console.log(err)
        return res.status(500).josn({message: 'Internal Server Error'})
    }
}

async function updateDepartment(req,res){
    try{
        const {name, manager_id} = req.body

        const department = await Department.findByIdAndUpdate(
            req.paras.id,
            {name, manager_id},
            {new: ture, runValidators: true}
        )
        if (!department){
            return res.status(404).json({message: 'Department Not Found.'})
        }
        return res.status(200).json(departmert)
    }
    catch(err){
        console.log(err)
        if (err.code === 11000){
            return res.status(409).json({
                message: 'A department with this name already exists for this company.'
            })
        }
        return res.status(500).json({message: 'Internal Server Error'})
    }
}


module.exports = {
    createDepartment, getDepartment, getDepartmentById, updateDepartment
}