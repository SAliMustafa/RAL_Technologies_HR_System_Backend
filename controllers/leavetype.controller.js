const mongoose = require('mongoose')
const LeaveType = require('../models/LeaveType')

const validateNextLeaveType = async(nextId, currentId = null)=>{
    if(!nextId) return null

    if (currentId && nextId.toString() === currentId.toString()){
        throw new Error('A leave typee cannot point to itself as the next type.')
    }

    const exists = await LeaveType.findById(nextId)

    if(!exists) {
        throw new Error('next_leave_type_id does not match an existing leave type.')
    }
    return nextId
}

async function createLeaveType(req,res){
    try{
    const {
      leave_type_name,
      max_days_per_year,
      pay_fraction,
      requires_service_months,
      requires_document,
      carry_forward,
      max_carry_forward,
      counts_toward_service,
      once_per_lifetime,
      gender_restriction,
      next_leave_type_id,
    } = req.body
    
    if (!leave_type_name || max_days_per_year === undefined){
        return res.status(400).json({message: "leave_type_name and max_days_per_year are required."})
    }

    const nextId = await validateNextLeaveType(next_leave_type_id)

    const leaveType = await LeaveType.create({
      leave_type_name,
      max_days_per_year,
      pay_fraction,
      requires_service_months,
      requires_document,
      carry_forward,
      max_carry_forward,
      counts_toward_service,
      once_per_lifetime,
      gender_restriction,
      next_leave_type_id,  
      next_leave_type_id: nextId      
    })

    return res.status(201).json(leaveType)
    } catch(err){
        console.log(err)
    }
}

async function getLeaveType(req,res){
    try{
        const includeInactive = await req.query.includeInactive === 'true'
        const filter = includeInactive ? {} : {is_active: true}
        const leaveType = await LeaveType.find(filter).populate("next_leave_type_id", "leave_type_name").sort({leave_type_name: 1})
    
        res.status(200).json({leaveType})
    }catch(err){
        console.log(err)
    }
}

module.exports = {
    createLeaveType,
    getLeaveType
}