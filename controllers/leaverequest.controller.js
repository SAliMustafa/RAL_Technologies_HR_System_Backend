const mongoose = require("mongoose");
const LeaveRequest = require("../models/LeaveRequest");
const LeaveType = require("../models/LeaveType");
const LeaveAllocation = require("../models/LeaveAllocation");
const Employee = require("../models/Employee");
const Holiday = require("../models/Holiday");
const { adjustDaysTaken } = require("./leaveAllocationController");

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
    if(isHalfDay) return 0.5

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
    return count
}

const monthsOfService = (dateOfJoining) => {
    const now = new Date()
    return (
        (now.getFullYear() - dateOfJoining.getFullYear()) * 12 + 
        (now.getMonth() - dateOfJoining.getMonth())
    )
}

const findApplicableAllocation = (employeeId, leaveTypeId, onDate) => 
    LeaveAllocation.findOne({
        employee_id: employeeId,
        leave_type_id: leaveTypeId,
        period_start: {$lte: onDate},
        period_end: {$gte: onDate}
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
            throw new Error(`This leave type is restricted to ${leaveType.gender_restriction} emplyees`)
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

    const overlap = await findOverlab(employee._id, from_date, to_date)
    if(overlap){
        throw new Error("This employee already has a pending or approved request that overlaps these dates.")
    }
    const allocation = await findApplicableAllocation(employee._id, leaveType._id, from_date)
    if(!allocation){
        throw new Error('No leave allocation found for this employee, leave type, and period.')
    }
    const remaining = allocation.days_allocated + allocation.days_carried_forward - allocation.days_taken
    if(total_days > remaining){
        throw new Error(`Insufficient balance: ${remaining} day(s) remaining, ${total_days} requested.`)
    }
    return {allocation, remaining}

}
module.exports = {

}