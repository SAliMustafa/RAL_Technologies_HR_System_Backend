const LeaveType = require('../models/LeaveType')
const AuditLog = require('../models/AuditLog')

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

    if(err.name === 'ValidationError' || err.name === 'CastError'){
        return res.status(400).json({message: err.message})
    }

    return res.status(500).json({message: 'Internal server error.'})
}

const createHttpError = (status, message) => {
    const error = new Error(message)
    error.status = status
    return error
}

const validateNextLeaveType = async(nextId, currentId = null)=>{
    if(!nextId) return null

    let nextLeaveType

    try{
        nextLeaveType = await LeaveType.findById(nextId).select('_id next_leave_type_id')
    }catch(err){
        if(err.name === 'CastError'){
            throw createHttpError(400, 'next_leave_type_id must be a valid ID.')
        }
    throw err
    }

    if(!nextLeaveType){
        throw createHttpError(400, 'next_leave_type_id does not match an existing leave type.')
    }
    if(!currentId) return nextId
        const currentIdString = currentId.toString()
        const visited = new Set()

        let current = nextLeaveType

        while(current){
            const currentChainId = current._id.toString()
            if(currentChainId === currentIdString){
                throw createHttpError(400, 'The selected next leave type would create a circular chain')
            }
            if(visited.has(currentChainId)){
                throw createHttpError(400, 'The selected next leave type already has a circular chain.')
            }
            visited.add(currentChainId)
            if(!current.next_leave_type_id){
                break
            }
            current = await LeaveType.findById(current.next_leave_type_id)
                .select('_id next_leave_type_id')
                if(!current){
                    throw createHttpError(400, 'The selected next leave type contains a broken chain.')
                }
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
        return res.status(400).json({message: "leave_type_name, max_days_per_year and pay_fraction are required."})
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

        const auditFields = {
            leave_type_name: leaveType.leave_type_name,
            max_days_per_year: leaveType.max_days_per_year,
            pay_fraction: leaveType.pay_fraction,
            requires_service_months: leaveType.requires_service_months,
            requires_document: leaveType.requires_document,
            carry_forward: leaveType.carry_forward,
            max_carry_forward: leaveType.max_carry_forward,
            counts_toward_service: leaveType.counts_toward_service,
            once_per_lifetime: leaveType.once_per_lifetime,
            gender_restriction: leaveType.gender_restriction,
            next_leave_type_id: leaveType.next_leave_type_id,
            is_active: leaveType.is_active
        }

        const auditLogs = []
        for(const [field_name, value] of Object.entries(auditFields)){
            if(value !== undefined && value !== null){
                auditLogs.push({
                    table_name: 'LeaveType',
                    record_id: leaveType._id.toString(),
                    action: 'create',
                    changed_by: req.user._id,
                    field_name,
                    old_value: null,
                    new_value: value.toString(),
                    ip_address: req.ip
                })
            }
        }

        if(auditLogs.length > 0){
            await AuditLog.insertMany(auditLogs)
        }

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
        const existingLeaveType = await LeaveType.findById(id)
        if(!existingLeaveType){
            return res.status(404).json({success: false, message: "Leave type not found."})
        }
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

        const auditLogs = []
        for (const field_name of Object.keys(updates)){
            const oldValue = 
                existingLeaveType[field_name] === undefined || 
                existingLeaveType[field_name] === null
                ? ''
                : existingLeaveType[field_name].toString()
            const newValue = 
                updated[field_name] === undefined ||
                updated[field_name] === null
                ? ''
                : updated[field_name].toString()
            if(oldValue !== newValue){
                auditLogs.push({
                    table_name: 'LeaveType',
                    record_id: updated._id.toString(),
                    action: 'update',
                    changed_by: req.user._id,
                    field_name,
                    old_value: oldValue,
                    new_value: newValue,
                    ip_address: req.ip
                })
            }
        }

        if(auditLogs.length>0){
            await AuditLog.insertMany(auditLogs)
        }

        return res.status(200).json(updated)

    }catch(err){
        return handleError(res, err)
    }
}

async function deactivateLeaveType(req,res){
    try{
        const {id} = req.params
        const existingLeaveType = await LeaveType.findById(id)
        if(!existingLeaveType){
            return res.status(404).json({success: false, message: "Leave type not found."})
        }
        if(!existingLeaveType.is_active){
            return res.status(400).json({success: false, message: "Leave type is already inactive."})
        }
        const leaveType = await LeaveType.findByIdAndUpdate(id, {is_active: false}, {new: true, runValidators: true} )

        if (!leaveType) {
            return res.status(404).json({ success: false, message: "Leave type not found." });
        }

        await AuditLog.create({
            table_name: 'LeaveType',
            record_id: leaveType._id.toString(),
            action: 'delete',
            changed_by: req.user._id,
            field_name: 'is_active',
            old_value: existingLeaveType.is_active.toString(),
            new_value: leaveType.is_active.toString(),
            reason: 'Leave type deactivated by HR',
            ip_address: req.ip
        })

        return res.status(200).json(leaveType)
    }catch(err){
        return handleError(res, err)
    }
}

async function activateLeaveType(req,res){
    try{
        const {id} = req.params
        const existingLeaveType = await LeaveType.findById(id)
        if(!existingLeaveType){
            return res.status(404).json({success: false, message: "Leave type not found."})
        }
        if(existingLeaveType.is_active){
            return res.status(400).json({success: false, message: "Leave type is already active."})
        }
        const leaveType = await LeaveType.findByIdAndUpdate(id, {is_active: true}, {new: true, runValidators: true} )

        if (!leaveType) {
            return res.status(404).json({ success: false, message: "Leave type not found." });
        }

        await AuditLog.create({
            table_name: 'LeaveType',
            record_id: leaveType._id.toString(),
            action: 'update',
            changed_by: req.user._id,
            field_name: 'is_active',
            old_value: existingLeaveType.is_active.toString(),
            new_value: leaveType.is_active.toString(),
            reason: 'Leave type activated by HR',
            ip_address: req.ip
        })

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
    deactivateLeaveType,
    activateLeaveType
}