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
        res.status(500).json({message: err.message})
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

        if(leave_type_id){
            if(!isValidId(leave_type_id)){
                return res.status(400).json({message: "Invalid leave_type_id."})
            }
            filter.leave_type_id = leave_type_id
        }

        if(req.user){
            if(req.user.role === 'employee'){
                filter.employee_id = req.user.employee_id
            } else if(req.user.role === 'manager'){
                const teamId = await Employee.find({reports_to: req.user.employee_id}).distinct('_id')
                teamId.push(req.user.employee_id)
                filter.employee_id = filter.employee_id 
                ? filter.employee_id : {$in: teamId}
            }
        }

        const allocation = await LeaveAllocation.find(filter)
            .populate("employee_id", "employee_code name_en")
            .populate("leave_type_id", "leave_type_name")
            .sort({period_start: -1})

        return res.status(200).json({count: allocation.length, data: allocation})

    }catch(err){
        return res.status(500).json({message: err.message})
    }
}

async function getAllocationById(req,res){
    try{
        const {id} = req.params
        if(!isValidId(id)){
            return res.status(400).json({message: "Invalid allocation id."})
        }

        const allocation = await LeaveAllocation.findById(id)
            .populate("employee_id", "employee_code name_en")
            .populate("leave_type_id", "leave_type_name")

        if(!allocation){
            return res.status(404).json({message: "Allocation not found"})
        }
        if(req.user.role === 'employee' && allocation.employee_id._id.toString() !== req.user.employee_id){
            return res.status(403).json({ success: false, message: "Not authorized to view this allocation." });
        }
        return res.status(200).json(allocation)
    }catch(err){
        return res.status(500).json({message: err.message})
    }
}

async function updateAllocation(req,res){
    try{
        const {id} = req.params
        if(!isValidId(id)){
            return res.status(400).json({message: "Invalid allocation id."})
        }      
        const {period_start, period_end, days_allocated, days_carried_forward} = req.body
        if (period_start && period_end && new Date(period_end) <= new Date(period_start)) {
            return res.status(400).json({message: "period_end must be after period_start." });
        }          
        const updates = {
            ...(period_start !== undefined && {period_start}),
            ...(period_end !== undefined && {period_end}),
            ...(days_allocated !== undefined && {days_allocated}),
            ...(days_carried_forward !== undefined && {days_carried_forward}),
        }

    const updated = await LeaveAllocation.findByIdAndUpdate(id, updates, {
        new: true, 
        runValidators: true
    })

    if(!updated){
        return res.status(404).json({message: "Allocation not found"})
    }

    res.status(200).json(updated)
    }catch(err){
        res.status(500).json({message: err.message})
    }
}

async function deleteAllocation(req,res){
    try{
        const {id} = req.params
        if(!isValidId(id)){
            return res.status(400).json({message: "Invalid allocation id."})
        }
        const allocation = await LeaveAllocation.findById(id)
        if(!allocation){
            return res.status(404).json({message: "Allocation not found"})
        }
        if(allocation.days_taken > 0){
            return res.status(409).json({
                message: "Cannot delete an allocation that already has days taken against it."
            })
        }
        await LeaveAllocation.findByIdAndDelete(id)
        return res.status(200).json({message: "Allocation deleted."})
    }catch(err){
        return res.status(500).json({message: err.message})
    }
}

async function adjustDaysTaken(allocationId, deltaDays, session = null){
    const allocation = await LeaveAllocation.findById(allocationId).session(session)
    if(!allocation){
        throw new Error("Allocation not found while adjusting days_taken.")
    }
    const newDaysTaken = allocation.days_taken + deltaDays
    const maxAvailable = allocation.days_allocated + allocation.days_carried_forward
    if(newDaysTaken < 0){
        throw new Error("days_taken cannot go negative.")
    }
    if(newDaysTaken > maxAvailable){
        throw new Error('Not enough remaining balance for this leave type.')
    }

    allocation.days_taken = newDaysTaken
    await allocation.save({session})
    return allocation
}


module.exports = {
    createLeaveAllocation,
    getAllLeaveAllocations,
    getAllocationById,
    updateAllocation,
    deleteAllocation,
    adjustDaysTaken
}