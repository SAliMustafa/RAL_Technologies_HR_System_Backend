const mongoose = require('mongoose')
const LeaveAllocation = require('../models/LeaveAllocation')
const LeaveType = require('../models/LeaveType')
const Employee = require('../models/Employee')
const User = require('../models/User')
const {logCreate, logUpdate, logDelete} = require('../utils/auditLog')

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id)

const handleError = (res, err) => {
    console.error(err)

    if (err.code === 11000) {
        return res.status(409).json({message: 'An allocation already exists for this employee, leave type, and period.'})
    }

    if(err.status){
        return res.status(err.status).json({
            message: err.message
        })
    }

    if(err.name === 'ValidationError' || err.name === 'CastError'){
        return res.status(400).json({message: err.message})
    }

    return res.status(500).json({message: 'Internal server error.'})
}

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
            return res.status(400).json({success: false, message: "employee_id, leave_type_id, period_start, period_end, and days_allocated are required."})
        }

        if(!isValidId(employee_id) || !isValidId(leave_type_id)){
            return res.status(400).json({success: false, message: "Invalid employee_id or leave_type_id."})
        }

        const startDate = new Date(period_start)
        const endDate = new Date(period_end)
        if(Number.isNaN(startDate.getTime()) || (Number.isNaN(endDate.getTime()))){
            return res.status(400).json({success: false, message: "period_start and period_end must be a valid dates."})
        }
            
        if(endDate <= startDate){
            return res.status(400).json({success: false, message: "period_end must be after period_start."})
        }

        const [employee, leaveType] = await Promise.all(
            [
                Employee.findById(employee_id),
                LeaveType.findById(leave_type_id)
            ]
        )

        if(!employee){
            return res.status(404).json({success: false, message: "Employee not found."})
        }

        if(!leaveType || !leaveType.is_active){
            return res.status(404).json({success: false, message: "Leave Type not found or inactive."})
        }

        if(days_allocated > leaveType.max_days_per_year){
            return res.status(400).json({success: false, message: 'days_allocated exceeds the leave type annual maximum.'})
        }
        if(!leaveType.carry_forward && days_carried_forward > 0){
            return res.status(400).json({success: false, message: "This leave type does not allow carried-forward days."})
        }
        if(leaveType.max_carry_forward !== undefined &&
            leaveType.max_carry_forward !== null &&
            (days_carried_forward ?? 0) > leaveType.max_carry_forward
        ) {
            return res.status(400).json({success: false, message: "days_carried_forward exceeds the leave type maximum."})
        }

        const overlap = await LeaveAllocation.findOne({
            employee_id,
            leave_type_id,
            period_start: {$lte: endDate},
            period_end: {$gte: startDate}
        })        

        if(overlap){
            return res.status(409).json({success: false, message: "An allocation exists that overlaps this period."})
        }

        const leaveAllocation = await LeaveAllocation.create({
            employee_id,
            leave_type_id,
            period_start: startDate,
            period_end: endDate,
            days_allocated,
            days_carried_forward: days_carried_forward ?? 0
        })

        await logCreate({
            tableName: 'LeaveAllocation',
            recordId: leaveAllocation._id,
            userId: req.user._id,
            data: {
                employee_id: leaveAllocation.employee_id,
                leave_type_id: leaveAllocation.leave_type_id,
                period_start: leaveAllocation.period_start,
                period_end: leaveAllocation.period_end,
                days_allocated: leaveAllocation.days_allocated,
                days_carried_forward: leaveAllocation.days_carried_forward,
                days_taken: leaveAllocation.days_taken
            },
            ipAddress: req.ip
        })

        return res.status(201).json(leaveAllocation)
        
    }catch(err){
        return handleError(res,err)
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
        const currentUser = await User.findById(req.user._id).select("role employeeId")
        if(req.user){
            if(!currentUser){
                return res.status(404).json({success: false, message: "User not found."})
            }
            if(['employee', 'manager'].includes(currentUser.role) && !currentUser.employeeId){
                return res.status(400).json({success: false, message: "User is not linked to an employee record."})
            }
            if(req.user.role === 'employee'){
                filter.employee_id = currentUser.employeeId
            } else if(req.user.role === 'manager'){
                const teamId = await Employee.find({reports_to: currentUser.employeeId}).distinct('_id')
                teamId.push(currentUser.employeeId)
                if(employee_id && !teamId.some(id=>String(id) === String(employee_id))){
                    return res.status(403).json({success: false, message: "Not authorized to view this employee's allocations."})
                }


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
        return handleError(res,err)
    }
}

async function getAllocationById(req,res){
    try{
        const {id} = req.params

        const allocation = await LeaveAllocation.findById(id)
            .populate("employee_id", "employee_code name_en")
            .populate("leave_type_id", "leave_type_name")

        if(!allocation){
            return res.status(404).json({success: false, message: "Allocation not found"})
        }
        const currentUser = await User.findById(req.user._id).select("role employeeId")
        if(!currentUser){
            return res.status(404).json({success: false, message: "User not found."})
        }
        if(['employee', 'manager'].includes(currentUser.role) && !currentUser.employeeId){
            return res.status(400).json({success: false, message: "User is not linked to an employee record."})
        }
        if(currentUser.role === 'employee' && String(allocation.employee_id._id) !== String(currentUser.employeeId)){
            return res.status(403).json({ success: false, message: "Not authorized to view this allocation." });
        }
        if(currentUser.role === 'manager'){
            const allocationEmployeeId = allocation.employee_id._id
            const isOwn = String(allocationEmployeeId) === String(currentUser.employeeId)
            const isDirectReport = await Employee.exists({
                _id: allocationEmployeeId,
                reports_to: currentUser.employeeId
            })
            if(!isOwn && !isDirectReport){
                return res.status(403).json({success: false, message: "Not authorized to view this allocation."})
            }
        }
        return res.status(200).json(allocation)
    }catch(err){
        return handleError(res,err)
    }
}

async function updateAllocation(req,res){
    try{
        const {id} = req.params
        const existingAllocation = await LeaveAllocation.findById(id)
        if(!existingAllocation){
            return res.status(404).json({success: false, message: "Allocation not found."})
        }
        const {period_start, period_end, days_allocated, days_carried_forward} = req.body

        const finalStart = period_start !== undefined ? new Date(period_start) : existingAllocation.period_start
        const finalEnd = period_end !== undefined ? new Date(period_end) : existingAllocation.period_end
        const finalAllocated = days_allocated !== undefined ? days_allocated : existingAllocation.days_allocated
        const finalCarried = days_carried_forward !== undefined ? days_carried_forward : existingAllocation.days_carried_forward

        if(Number.isNaN(finalStart.getTime()) || (Number.isNaN(finalEnd.getTime()))){
            return res.status(400).json({success: false, message: "period_start and period_end must be a valid dates."})
        }
            
        if(finalEnd <= finalStart){
            return res.status(400).json({success: false, message: "period_end must be after period_start."})
        }

        if((finalAllocated + finalCarried) < existingAllocation.days_taken){
            return res.status(409).json({success: false, message: "Allocated and carried-forward days cannot be less than days already taken."})
        }
        const leaveType = await LeaveType.findById(existingAllocation.leave_type_id)

        if(!leaveType){
            return res.status(404).json({success: false, message: "Associated leave type not found."})
        }
        if(finalAllocated > leaveType.max_days_per_year){
            return res.status(400).json({success: false, message: "days_allocated exceeds the leave type annual maximum."})
        }
        if(!leaveType.carry_forward && finalCarried > 0){
            return res.status(400).json({success: false, message: "This leave type does not allow carried-forward days."})
        }
        if(leaveType.max_carry_forward !== undefined &&
            leaveType.max_carry_forward !== null &&
            finalCarried > leaveType.max_carry_forward
        ) {
            return res.status(400).json({success: false, message: "days_carried_forward exceeds the leave type maximum."})
        }
        const overlap = await LeaveAllocation.findOne({
            _id: {$ne: id},
            employee_id: existingAllocation.employee_id,
            leave_type_id: existingAllocation.leave_type_id,
            period_start: {$lte: finalEnd},
            period_end: {$gte: finalStart}
        })        

        if(overlap){
            return res.status(409).json({success: false, message: "An allocation exists that overlaps this period."})
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
        return res.status(404).json({success: false, message: "Allocation not found"})
    }

    return res.status(200).json(updated)
    }catch(err){
        return handleError(res,err)
    }
}

async function deleteAllocation(req,res){
    try{
        const {id} = req.params

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
        return handleError(res,err)
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