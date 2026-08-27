const mongoose = require('mongoose')
const LeaveAllocation = require('../models/LeaveAllocation')
const LeaveType = require('../models/LeaveType')
const Employee = require('../models/Employee')

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id)

async function createLeaveAllocation(req,res){
    try{
        const {
            employee_id,
            leave_type_id,
            period_start,
            period_end,
            days_allocated,
            days_carried_forward
        } = req.body

        if(!employee_id || !leave_type_id || !period_start || !period_end || days_allocated === undefined){
            return res.status(400).json({message: "employee_id, leave_type_id, period_start, period_end, and days_allocated are required."})
        }

        if(!isValidId(employee_id) || !isValidId(leave_type_id)){
            return res.status(400).json({message: "Invalid employee_id or leave_type_id."})
        }

        if(new Date(period_end) <= new Date(period_start)){
            return res.status(400).json({message: "period_end must be after period_start."})
        }

        const [employee, leaveType] = await Promise.all(
            [
                Employee.findById(employee_id),
                LeaveType.findById(leave_type_id)
            ]
        )

        if(!employee){
            return res.status(404).json({message: "Employee not found."})
        }

        if(!leaveType || !leaveType.is_active){
            return res.status(404).json({message: "Leave Type not found or inactive."})
        }

        const leaveAllocation = await LeaveAllocation.create({
            employee_id,
            leave_type_id,
            period_start,
            period_end,
            days_allocated,
            days_carried_forward: days_carried_forward || 0
        })

        return res.status(201).json(leaveAllocation)
        
    }catch(err){
        res.status(500).json({message: err})
    }
}

async function getAllLeaveAllocations(req,res){
    try{
        const {employee_id, leave_type_id} = req.query
        const filter = {}

        if(employee_id){
            if(!isValidId(employee_id)){
                return res.status(400).json({message: "Invalid employee_id."})
            }
            filter.employee_id = employee_id
        }
    }catch(err){
        console.log(err)
    }
}


module.exports = {
    createLeaveAllocation
}