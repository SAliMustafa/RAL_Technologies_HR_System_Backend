const mongoose = require("mongoose");
const LeaveRequest = require("../models/LeaveRequest");
const LeaveType = require("../models/LeaveType");
const LeaveAllocation = require("../models/LeaveAllocation");
const Employee = require("../models/Employee");
const Holiday = require("../models/Holiday");
const { adjustDaysTaken } = require("./leaveallocation.controller");
const User = require('../models/User')
const {logCreate, logUpdate, logDelete} = require('../utils/auditLog')

const handleError = (res, err, fallbackStatus = 500) => {
  console.error(err);
  return res.status(fallbackStatus).json({
    success: false,
    message: err.message || "Something went wrong",
  });
};

const isValidId = (id) => mongoose.Types.ObjectId.isValid(id)

const isWeekend = (date) => {
    const day = date.getDay()
    return day === 5 || day === 6
}

const computeTotalDays = async (fromDate, toDate, isHalfDay) => {
    const confirmedHolidays = await Holiday.find({
        date: {$gte: fromDate, $lte: toDate},
        is_confirmed: true
    }).distinct("date")
    const holidaySet = new Set(confirmedHolidays.map((d)=> new Date(d).toDateString()))

    let count = 0;
    const cursor = new Date(fromDate)
    while (cursor <= toDate){
        if(!isWeekend(cursor) && !holidaySet.has(cursor.toDateString())){
            count += 1
        }
        cursor.setDate(cursor.getDate() + 1)
    }
    return isHalfDay ? (count > 0 ? 0.5 : 0) : count
}

const monthsOfService = (dateOfJoining) => {
    const now = new Date()
    return (
        (now.getFullYear() - dateOfJoining.getFullYear()) * 12 + 
        (now.getMonth() - dateOfJoining.getMonth())
    )
}

const findApplicableAllocation = (employeeId, leaveTypeId, fromDate, toDate) =>
    LeaveAllocation.findOne({
        employee_id: employeeId,
        leave_type_id: leaveTypeId,
        // The allocation must cover the complete leave period.
        period_start: {$lte: fromDate},
        period_end: {$gte: toDate}
    })

const findOverlap = (employeeId, fromDate, toDate, excludeId = null) =>
    LeaveRequest.findOne({
        employee_id: employeeId,
        status: {$in: ['pending', 'approved']},
        from_date: {$lte: toDate},
        to_date: {$gte: fromDate},
        ...(excludeId && { _id: {$ne: excludeId}})
    })

const runSubmitChecks = async (employee, leaveType, {from_date, to_date, total_days, document}) => {
    const GENDER_RESTRICTION_MAP = {
        maternity: 'female',
        paternity: 'male'
    }
    if(leaveType.gender_restriction){
        const requiredGender = GENDER_RESTRICTION_MAP[leaveType.gender_restriction]
        if(requiredGender && employee.gender !== requiredGender) {
            throw new Error(`This leave type is restricted to ${leaveType.gender_restriction} employees`)
        }
    }
    if(leaveType.requires_document && !document){
        throw new Error('This leave type requires a supporting document before it can be submitted.')
    }
    if(leaveType.requires_service_months &&
        monthsOfService(employee.date_of_joining) < leaveType.requires_service_months
    ) {
        throw new Error(`This leave type requires at least ${leaveType.requires_service_months} months of service.`)
    }
    if(leaveType.once_per_lifetime){
        const usedBefore = await LeaveRequest.findOne({
            employee_id: employee._id,
            leave_type_id: leaveType._id,
            status: 'approved'
        })
        if(usedBefore){
            throw new Error("This leave type can only be used once.")
        }
    }

    const overlap = await findOverlap(employee._id, from_date, to_date)
    if(overlap){
        throw new Error("This employee already has a pending or approved request that overlaps these dates.")
    }
    const allocation = await findApplicableAllocation(employee._id, leaveType._id, from_date, to_date)
    if(!allocation){
        throw new Error('No leave allocation found for this employee, leave type, and period.')
    }
    const remaining = allocation.days_allocated + allocation.days_carried_forward - allocation.days_taken
    if(total_days > remaining){
        throw new Error(`Insufficient balance: ${remaining} day(s) remaining, ${total_days} requested.`)
    }
    return {allocation, remaining}

}

async function createLeaveRequest(req,res){
    try{
        const {
            employee_id,
            leave_type_id,
            from_date, 
            to_date,
            is_half_day,
            half_day_date,
            reason,
            document,
            submit,
        } = req.body

        const currentUser = await User.findById(req.user._id).select('role employeeId')
        if(!currentUser){
            return res.status(404).json({success: false, message: "User not found."})
        }
        if(['employee', 'manager'].includes(currentUser.role) && !currentUser.employeeId){
            return res.status(400).json({success: false, message: "User is not linked to an employee record."})
        }

        if(!employee_id || !leave_type_id){
            return res.status(400).json({
                success: false,
                message: "employee_id and leave_type_id are required."
            })
        }
        if(!isValidId(employee_id) || !isValidId(leave_type_id)){
            return res.status(400).json({success: false, message: "Invalid employee_id or leave_type_id"})
        }
        if(currentUser.role !== 'hr_admin' && String(employee_id) !== String(currentUser.employeeId)){
            return res.status(403).json({success: false, message: "You can only create leave requests for yourself."})
        }
        if(is_half_day !== undefined && typeof is_half_day !== 'boolean'){
            return res.status(400).json({success: false, message: "is_half_day must be true or false."})
        }

        const [employee, leaveType] = await Promise.all([
            Employee.findById(employee_id),
            LeaveType.findById(leave_type_id)
        ])

        if (!employee) {
            return res.status(404).json({ success: false, message: "Employee not found." });
            }
        if (!leaveType || !leaveType.is_active) {
            return res.status(404).json({ success: false, message: "Leave type not found or inactive." });
        }

        let finalFrom, finalTo, finalHalfDayDate
        if(is_half_day){
            if(!half_day_date){
                return res.status(400).json({success: false, message: 'half_day_date is required for a half-day request.'})
            }
            finalFrom = finalTo = finalHalfDayDate = new Date(half_day_date)
        } else {
            if(!from_date || !to_date){
                return res.status(400).json({success: false, message: "from_date and to_date are required."})
            }
            finalFrom = new Date(from_date)
            finalTo = new Date(to_date)
        }
        if(Number.isNaN(finalFrom.getTime()) || Number.isNaN(finalTo.getTime())){
            return res.status(400).json({success: false, message: "Leave dates must be valid dates."})
        }
        if(finalTo < finalFrom){
            return res.status(400).json({success: false, message: "to_date cannot be before from_date."})
        }
        if(!employee.reports_to){
            return res.status(400).json({
                success: false,
                message: "Employee has no manager assigned, cannot determine an approver."
            })
        }

        const total_days = await computeTotalDays(finalFrom, finalTo, !!is_half_day)
        if(total_days <= 0){
            return res.status(400).json({success: false, message: "The selected period contains no working days."})
        }
        const status = submit ? "pending" : "draft"
        let balance_at_request

        if (submit){
            const {remaining} = await runSubmitChecks(employee, leaveType, {
                from_date: finalFrom, 
                to_date: finalTo, 
                total_days,
                document
            })
            balance_at_request = remaining
        }

        const leaveRequest = await LeaveRequest.create({
            employee_id,
            leave_type_id,
            from_date: finalFrom,
            to_date: finalTo,
            is_half_day: !!is_half_day,
            half_day_date: finalHalfDayDate,
            total_days,
            reason,
            document,
            approver_id: employee.reports_to,
            status,
            balance_at_request
        })

        await logCreate({
            tableName: 'LeaveRequest',
            recordId: leaveRequest._id,
            userId: req.user._id,
            data: {
                employee_id: leaveRequest.employee_id,
                leave_type_id: leaveRequest.leave_type_id,
                from_date: leaveRequest.from_date,
                to_date: leaveRequest.to_date,
                is_half_day: leaveRequest.is_half_day,
                half_day_date: leaveRequest.half_day_date,
                total_days: leaveRequest.total_days,
                reason: leaveRequest.reason,
                document: leaveRequest.document,
                approver_id: leaveRequest.approver_id,
                status: leaveRequest.status,
                balance_at_request: leaveRequest.balance_at_request
            },
            ipAddress: req.ip
        })

        return res.status(201).json({success: true, data: leaveRequest})
    }catch(err){
        return handleError(res,err,500)
    }
}

async function updateLeaveRequest(req,res){
    try{
        const {id} = req.params
        if(!isValidId(id)){
            return res.status(400).json({success: false, message: "Invalid leave request id"})
        }
        const existing = await LeaveRequest.findById(id)
        if(!existing){
            return res.status(404).json({success: false, message: "Leave request not found."})
        }
        const currentUser = await User.findById(req.user._id).select('role employeeId')
        if(!currentUser){
            return res.status(404).json({success: false, message: 'User not found.'})
        }
        if(['employee', 'manager'].includes(currentUser.role) && !currentUser.employeeId){
            return res.status(400).json({success: false, message: "User is not linked to an employee record."})
        }
        if(currentUser.role !== 'hr_admin' && String(existing.employee_id) !== String(currentUser.employeeId)){
            return res.status(403).json({success: false, message: "You are not authorized to update this leave request."})
        }
        if(existing.status !== "draft"){
            return res.status(409).json({
                success: false,
                message: "Only draft requests can be edited. Cancel and create a new request instead."
            })
        }

        const {leave_type_id, from_date, to_date, is_half_day, half_day_date, reason, document} = req.body

        if(is_half_day !== undefined && typeof is_half_day !== 'boolean'){
            return res.status(400).json({success: false, message: "is_half_day must be true or false."})
        }

        const updates = {}
        if(leave_type_id !== undefined){
            if(!isValidId(leave_type_id)){
                return res.status(400).json({success: false, message: "Leave type not found or inactive."})
            }
            const leaveType = await LeaveType.findOne({
                _id: leave_type_id,
                is_active: true
            })
            if(!leaveType){
                return res.status(404).json({success: false, message: "Leave type is not found or inactive"})
            }
            updates.leave_type_id = leave_type_id
        }

        if(reason !== undefined) updates.reason = reason
        if(document !== undefined) updates.document = document

        const nextIsHalfDay = is_half_day !== undefined ? is_half_day : existing.is_half_day
        const datesChanged = from_date !== undefined || to_date !== undefined || half_day_date !== undefined || is_half_day !== undefined

        if(datesChanged){
            if(nextIsHalfDay){
                const hdDate = half_day_date || existing.half_day_date
                if(!hdDate){
                    return res.status(400).json({success: false, message: "half_day_date is required for a half-day request."})
                }
                updates.is_half_day = true
                updates.half_day_date = new Date(hdDate)
                updates.from_date = updates.half_day_date
                updates.to_date = updates.half_day_date
            }else{
                const newFrom = new Date(from_date || existing.from_date)
                const newTo = new Date(to_date || existing.to_date)
                updates.is_half_day = false
                // Clear the old half-day date when changing back to full-day leave.
                updates.half_day_date = null
                updates.from_date = newFrom
                updates.to_date = newTo
            }
            if(Number.isNaN(updates.from_date.getTime()) || Number.isNaN(updates.to_date.getTime())){
                return res.status(400).json({success: false, message: "Leave dates must be valid dates."})
            }
            if(updates.to_date < updates.from_date){
                return res.status(400).json({success: false, message:"to_date cannot be before from_date."})
            }
            updates.total_days = await computeTotalDays(updates.from_date, updates.to_date, updates.is_half_day)
            if(updates.total_days <= 0){
                return res.status(400).json({success: false, message: "The selected period contains no working days."})
            }
        }
        if(Object.keys(updates).length === 0){
            return res.status(400).json({success: false, message: "No update fields were provided."})
        }
        const updated = await LeaveRequest.findByIdAndUpdate(id, updates, {new: true, runValidators: true})

        await logUpdate({
            tableName: "LeaveRequest",
            recordId: updated._id,
            userId: req.user._id,
            before: existing.toObject(),
            after: updates,
            reason: "Draft leave request updated",
            ipAddress: req.ip
        })

        return res.status(200).json({success: true, data: updated})
    }catch(err){
        return handleError(res, err)
    }
}

async function submitLeaveRequest(req,res){
    try{
        const {id} = req.params
        if(!isValidId(id)){
            return res.status(400).json({success: false, message: "Invalid leave request id."})
        }
        const leaveRequest = await LeaveRequest.findById(id)
        if(!leaveRequest){
            return res.status(404).json({success: false, message: "Leave request not found"})
        }
        const currentUser = await User.findById(req.user._id).select('role employeeId')
        if(!currentUser){
            return res.status(404).json({success: false, message: "User not found."})
        }
        if(['employee', 'manager'].includes(currentUser.role) && !currentUser.employeeId){
            return res.status(400).json({success: false, message: "User is not linked to an employee record."})
        }
        if(currentUser.role !== 'hr_admin' && String(leaveRequest.employee_id) !== String(currentUser.employeeId)){
            return res.status(403).json({success: false, message: "You are not authorized to submit this leave request."})
        }
        if(leaveRequest.status !== "draft"){
            return res.status(409).json({success: false, message: 'Only draft requests can be submitted.'})
        }
        const [employee, leaveType] = await Promise.all([
            Employee.findById(leaveRequest.employee_id),
            LeaveType.findById(leaveRequest.leave_type_id)
        ])

        if(!employee){
            return res.status(404).json({success: false, message: "Employee not found."})
        }
        if(!leaveType || !leaveType.is_active){
            return res.status(404).json({success: false, message: "Leave type not found or inactive."})
        }
        if(!employee.reports_to){
            return res.status(400).json({success: false, message: "Employee has no manager assigned, cannot determine an approver."})
        }

        const recalculatedTotalDays = await computeTotalDays(leaveRequest.from_date, leaveRequest.to_date, leaveRequest.is_half_day)
        if(recalculatedTotalDays <= 0){
            return res.status(400).json({success: false, message: "The selected period contains no working days."})
        }
        const {remaining} = await runSubmitChecks(employee, leaveType, {
            from_date: leaveRequest.from_date,
            to_date: leaveRequest.to_date,
            total_days: recalculatedTotalDays,
            document: leaveRequest.document
        })

        const beforeSubmit = leaveRequest.toObject()

        leaveRequest.status = 'pending'
        leaveRequest.balance_at_request = remaining
        leaveRequest.total_days = recalculatedTotalDays
        leaveRequest.approver_id = employee.reports_to
        await leaveRequest.save()

        await logUpdate({
            tableName: "LeaveRequest",
            recordId: leaveRequest._id,
            userId: req.user._id,
            before: beforeSubmit,
            after: {
                status: leaveRequest.status,
                balance_at_request: leaveRequest.balance_at_request,
                total_days: leaveRequest.total_days,
                approver_id: leaveRequest.approver_id
            },
            reason: "Leave request submitted",
            ipAddress: req.ip
        })

        return res.status(200).json({success: true, data: leaveRequest})
    }catch(err){
        return handleError(res,err)
    }
}

async function approveLeaveRequest(req,res){
    try{
        const {id} = req.params
        if(!isValidId(id)){
            return res.status(400).json({success: false, message: "Invalid leave request id."})
        }
        const leaveRequest = await LeaveRequest.findById(id)
        if(!leaveRequest){
            return res.status(404).json({success: false, message: "Leave request not found."})
        }
        if(leaveRequest.status !== 'pending'){
            return res.status(409).json({success: false, message: "Only pending requests can be approved."})
        }
        const currentUser = await User.findById(req.user._id).select('role employeeId')
        if(!currentUser){
            return res.status(404).json({success: false, message: "User not found."})
        }
        if(currentUser.role !== 'hr_admin' && (currentUser.role !== 'manager' || String(leaveRequest.approver_id) !== String(currentUser.employeeId))){
            return res.status(403).json({success: false, message: "You are not authorized to decide this request."})
        }
        const allocation = await findApplicableAllocation(leaveRequest.employee_id, leaveRequest.leave_type_id, leaveRequest.from_date, leaveRequest.to_date)
        if(!allocation){
            return res.status(409).json({success: false, message: "No matching allocation found to deduct from."})
        }
        await adjustDaysTaken(allocation._id, leaveRequest.total_days)
        const beforeApproval = leaveRequest.toObject()
        leaveRequest.status = 'approved'
        await leaveRequest.save()

        await logUpdate({
            tableName: "LeaveRequest",
            recordId: leaveRequest._id,
            userId: req.user._id,
            before: beforeApproval,
            after: {
                status: leaveRequest.status,
            },
            reason: "Leave request approved",
            ipAddress: req.ip
        })

        return res.status(200).json({success: true, data: leaveRequest})
    }catch(err){
        return handleError(res,err)
    }
}

async function rejectLeaveRequest(req,res){
    try{
        const {id} = req.params
        const {decision_note} = req.body || {}
        if(!isValidId(id)){
            return res.status(400).json({success: false, message: "Invalid leave request id."})
        }
        if(!decision_note){
            return res.status(400).json({success: false, message: "decision_note is required when rejecting a request."})
        }
        const leaveRequest = await LeaveRequest.findById(id)
        if(!leaveRequest){
            return res.status(404).json({success: false, message: "Leave request not found."})
        }
        if(leaveRequest.status !== 'pending'){
            return res.status(409).json({success: false, message: "Only pending requests can be rejected."})
        }
        const currentUser = await User.findById(req.user._id).select('role employeeId')
        if(!currentUser){
            return res.status(404).json({success: false, message: "User not found."})
        }
        if(currentUser.role !== 'hr_admin' && (currentUser.role !== 'manager' || String(leaveRequest.approver_id) !== String(currentUser.employeeId))){
            return res.status(403).json({success: false, message: "You are not authorized to decide this request."})
        }
        const beforeRejection = leaveRequest.toObject()
        leaveRequest.status = 'rejected'
        leaveRequest.decision_note = decision_note
        await leaveRequest.save()
        await logUpdate({
            tableName: "LeaveRequest",
            recordId: leaveRequest._id,
            userId: req.user._id,
            before: beforeRejection,
            after: {
                status: leaveRequest.status,
                decision_note: leaveRequest.decision_note
            },
            reason: "Leave request rejected",
            ipAddress: req.ip
        })
        return res.status(200).json({success: true, data: leaveRequest})
    }catch(err){
        return handleError(res,err)
    }
}

async function cancelLeaveRequest(req,res){
    try{
        const {id} = req.params
        const {decision_note} = req.body || {}
        if(!isValidId(id)){
            return res.status(400).json({success: false, message: "Invalid leave request id."})
        }
        const leaveRequest = await LeaveRequest.findById(id)
        if(!leaveRequest){
            return res.status(404).json({success: false, message: "Leave request not found."})
        }
        const currentUser = await User.findById(req.user._id).select('role employeeId')
        if(!currentUser){
            return res.status(404).json({success: false, message: "User not found."})
        }
        if(['employee', 'manager'].includes(currentUser.role) && !currentUser.employeeId){
            return res.status(400).json({success: false, message: "User is not linked to an employee record."})
        }
        if(currentUser.role !== 'hr_admin' && String(leaveRequest.employee_id) !== String(currentUser.employeeId)){
            return res.status(403).json({success: false, message: "You are not authorized to cancel this leave request."})
        }
        if(['rejected', 'cancelled'].includes(leaveRequest.status)){
            return res.status(409).json({success: false, message: "This request is already finalized."})
        }
        const beforeCancellation = leaveRequest.toObject()
        if(leaveRequest.status === 'approved'){
            if(!decision_note){
                return res.status(400).json({success: false, message: "decision_note is required when cancelling an approved request."})
            }
            const allocation = await findApplicableAllocation(leaveRequest.employee_id, leaveRequest.leave_type_id, leaveRequest.from_date, leaveRequest.to_date)
            if(!allocation){
                return res.status(409).json({success: false, message: "No matching allocation found to restore the leave balance."})
            }
            await adjustDaysTaken(allocation._id, -leaveRequest.total_days)
            leaveRequest.decision_note = decision_note
        } else if(decision_note){
            leaveRequest.decision_note = decision_note
        }
        leaveRequest.status = 'cancelled'
        await leaveRequest.save()
        await logUpdate({
            tableName: "LeaveRequest",
            recordId: leaveRequest._id,
            userId: req.user._id,
            before: beforeCancellation,
            after: {
                status: leaveRequest.status,
                decision_note: leaveRequest.decision_note
            },
            reason: "Leave request cancelled",
            ipAddress: req.ip
        })
        return res.status(200).json({success: true, data: leaveRequest})
    }catch(err){
        return handleError(res,err)
    }
}

async function getAllLeaveRequests(req,res){
    try{
        const {employee_id, status} = req.query
        const filter = {}
        if(employee_id){
            if(!isValidId(employee_id)){
                return res.status(400).json({success: false, message: "Invalid employee id."})
            }
            filter.employee_id = employee_id
        }   
        const validStatuses = ['draft', 'pending', 'approved', 'rejected', 'cancelled']
        if(status && !validStatuses.includes(status)){
            return res.status(400).json({success: false, message: "Invalid leave request status."})
        }
        if(status) filter.status = status
        const currentUser = await User.findById(req.user._id).select('role employeeId')
        if(!currentUser){
            return res.status(404).json({success: false, message: "User not found."})
        }
        if(['employee', 'manager'].includes(currentUser.role) && !currentUser.employeeId){
            return res.status(400).json({success: false, message: "User is not linked to an employee record."})
        }
        if(currentUser){
            if(currentUser.role === 'employee') {filter.employee_id = currentUser.employeeId}
            else if(currentUser.role === 'manager'){
                filter.$or = [
                    {approver_id: currentUser.employeeId},
                    {employee_id: currentUser.employeeId}
                ]
            }
        }
        const requests = await LeaveRequest.find(filter)
            .populate("employee_id", "employee_code name_en")
            .populate("leave_type_id", "leave_type_name")
            .populate("approver_id", "employee_code name_en")
            .sort({createdAt: -1})
        return res.status(200).json({success: true, count: requests.length, data: requests})
    }catch(err){
        return handleError(res,err)
    }
}

async function getLeaveRequestById(req,res){
    try{
        const {id} = req.params
        if(!isValidId(id)){
            return res.status(400).json({success: false, message: "Invalid leave request id."})        }   
        const leaveRequest = await LeaveRequest.findById(id)
            .populate("employee_id", "employee_code name_en")
            .populate("leave_type_id", "leave_type_name")
            .populate("approver_id", "employee_code name_en")
        if(!leaveRequest){
            return res.status(404).json({success: false, message: 'Leave request not found'})
        }
        const currentUser = await User.findById(req.user._id).select('role employeeId')
        if(!currentUser){
            return res.status(404).json({success: false, message: "User not found."})
        }
        const employeeId = leaveRequest.employee_id?._id || leaveRequest.employee_id
        const approverId = leaveRequest.approver_id?._id || leaveRequest.approver_id
        const canView = currentUser.role === 'hr_admin' ||
            String(employeeId) === String(currentUser.employeeId) ||
            (currentUser.role === 'manager' && String(approverId) === String(currentUser.employeeId))
        if(!canView){
            return res.status(403).json({success: false, message: "You are not authorized to view this leave request."})
        }
        return res.status(200).json({success: true, data: leaveRequest})
    }catch(err){
        return handleError(res,err)
    }
}

async function deleteLeaveRequest(req,res){
    try{
        const {id} = req.params
        if(!isValidId(id)){
            return res.status(400).json({success: false, message: "Invalid leave request id."})
        }
        const leaveRequest = await LeaveRequest.findById(id)
        if(!leaveRequest){
            return res.status(404).json({success: false, message: "Leave request not found."})
        }
        const currentUser = await User.findById(req.user._id).select('role employeeId')
        if(!currentUser){
            return res.status(404).json({success: false, message: "User not found."})
        }
        if(['employee', 'manager'].includes(currentUser.role) && !currentUser.employeeId){
            return res.status(400).json({success: false, message: "User is not linked to an employee record."})
        }
        if(currentUser.role !== 'hr_admin' && String(leaveRequest.employee_id) !== String(currentUser.employeeId)){
            return res.status(403).json({success: false, message: "You are not authorized to delete this leave request."})
        }
        if(leaveRequest.status !== 'draft'){
            return res.status(409).json({success: false, message: "Only draft requests can be deleted. Use cancel for submitted requests."})
        }
        await LeaveRequest.findByIdAndDelete(id)
        await logDelete({
            tableName: "LeaveRequest",
            recordId: leaveRequest._id,
            userId: req.user._id,
            reason: req.body?.reason || 'Draft leave request deleted',
            ipAddress: req.ip
        })
        return res.status(200).json({success: true, message: "Draft leave request deleted."})
    }catch(err){
        return handleError(res,err)
    }
}

module.exports = {
    createLeaveRequest,
    updateLeaveRequest,
    submitLeaveRequest,
    approveLeaveRequest,
    rejectLeaveRequest,
    cancelLeaveRequest,
    getAllLeaveRequests,
    getLeaveRequestById,
    deleteLeaveRequest
}