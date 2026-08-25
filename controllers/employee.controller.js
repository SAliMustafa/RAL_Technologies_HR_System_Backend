const mongoose = require('mongoose')
const Employee = require('../models/Employee')

async function createEmployee(req,res){
    try{
        const employee = await Employee.create(req.body)
        res.status(201).json(employee)
    } catch(err){
        if(err.code === 11000) {
            return res.status(409).json({error: 'employee code or cpr number already exists'})
        }
        if (err.name === 'ValidationError') {
            return res.status(400).json({error: err.message})
        }
        res.status(500).json({error:err.message})
    }
}

async function getAllEmployees(req,res) {
    try{
        const {status,worker_category,company_id,department_id} = req.query
        const filter = {}
        if (status) filter.status = status
        if (worker_category) filter.worker_category = worker_category
        if (company_id) filter.company_id = company_id
        if (department_id) filter.department_id = department_id
        const employees = await Employee.find(filter)
        .populate('company_id')
      .populate('department_id')
      .populate('designation_id')
      .populate('reports_to', 'name_en name_ar employee_code')
      .populate('holiday_list_id')
      .populate('shift_type_id')
      .populate('user', 'username role')
      .sort({ createdAt: -1 })
 
    res.status(200).json(employees)
    } catch(err) {
        res.status(500).json({error:err.message})
    }
}

async function getEmployeeById(req,res) {
    try{

    } catch(err){

    }
}