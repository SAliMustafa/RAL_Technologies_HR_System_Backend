const LeaveType = require('../models/LeaveType')

const handleError = (res, err) => {
    console.error(err)

    if (err.code === 11000) {
        return res.status(409).json({message: 'A leave type with this name already exists.'})
    }

    if(err.status){
        return res.status(err.status).json({
            message: err.message
        })
    }

    if(err.name === 'ValidationError' || err.name == 'CastError')

    return res.status(500).json({message: 'Internal server error.'})
}

const createHttpError = (status, message) => {
    const error = new Error(message)
    error.status = status
    return error
}

const validateNextLeaveType = async(nextId, currentId = null)=>{
    if(!nextId) return null

    if (currentId && nextId.toString() === currentId.toString()){
        throw createHttpError(400, 'A leave type cannot point to itself as the next type.')
    }

    const exists = await LeaveType.findById(nextId)

    if(!exists) {
        throw createHttpError(400, 'next_leave_type_id does not match an existing leave type.')
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
    
    if (!leave_type_name || max_days_per_year === undefined || pay_fraction === undefined){
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
      next_leave_type_id: nextId      
    })

    return res.status(201).json(leaveType)
    } catch(err){
        return handleError(res, err)
    }
}

async function getAllLeaveTypes(req,res){
    try{
        const includeInactive = req.query.includeInactive === 'true'
        const filter = includeInactive ? {} : {is_active: true}
        const leaveType = await LeaveType.find(filter).populate("next_leave_type_id", "leave_type_name").sort({leave_type_name: 1})
    
        res.status(200).json({leaveType})
    }catch(err){
        return handleError(res, err)
    }
}

async function getLeaveTypeById(req,res){
    try{
        const {id} = req.params

        const leaveType = await LeaveType.findById(id).populate("next_leave_type_id", "leave_type_name")

        if(!leaveType){
            return res.status(404).json({message: "Leave type not found"})
        }
        return res.status(200).json({leaveType})

    }catch(err){
        return handleError(res, err)
    }
}

async function updateLeaveType(req,res){
    try{
        const {id} = req.params
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

        if (req.body.next_leave_type_id !== undefined){
            await validateNextLeaveType(next_leave_type_id, id)
        }

        const updates = {
            ...(leave_type_name !== undefined && {leave_type_name}),
            ...(max_days_per_year !== undefined && {max_days_per_year}),
            ...(pay_fraction !== undefined && {pay_fraction}),
            ...(requires_service_months !== undefined && {requires_service_months}),
            ...(requires_document !== undefined && { requires_document }),
            ...(carry_forward !== undefined && { carry_forward }),
            ...(max_carry_forward !== undefined && { max_carry_forward }),
            ...(counts_toward_service !== undefined && { counts_toward_service }),
            ...(once_per_lifetime !== undefined && { once_per_lifetime }),
            ...(gender_restriction !== undefined && { gender_restriction }),
            ...(next_leave_type_id !== undefined && { next_leave_type_id }),
        }

        const updated = await LeaveType.findByIdAndUpdate(id,updates,
            {new: true, runValidators: true}
        )

        if(!updated){
            return res.status(404).json({message: 'Leave type not found.'})
        }

        res.status(200).json(updated)

    }catch(err){
        return handleError(res, err)
    }
}

async function deactivateLeaveType(req,res){
    try{
        const {id} = req.params

        const leaveType = await LeaveType.findByIdAndUpdate(id, {is_active: false}, {new: true})

        if (!leaveType) {
            return res.status(404).json({ success: false, message: "Leave type not found." });
        }

        return res.status(200).json(leaveType)
    }catch(err){
        return handleError(res, err)
    }
}



module.exports = {
    createLeaveType,
    getAllLeaveTypes,
    getLeaveTypeById,
    updateLeaveType,
    deactivateLeaveType
}