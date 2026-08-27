const AttendanceCorrection = require('../models/AttendanceCorrection')
const Attendance = require('../models/Attendance')
const Employee = require('../models/Employee')
const User = require('../models/User')


async function createCorrectionRequest(req,res){
    try{
        const {employee_id, date, reason, requested_in_time, requested_out_time, requested_status} = req.body

        if (!employee_id || !date || !reason){
            return res.status(400).json({message: 'employee_id, date and reason are required.'})
        }

        const user = await User.findById(req.user._id)

        const managed = await Employee.exists({
            _id: employee_id,
            reports_to: user.employee.id
        })

        if(!managed){
            return res.status(403).json({
                message: 'You can only request corrections for your own team.'
            })
        }

        const correction = await AttendanceCorrection.create({
            employee_id,
            date,
            requested_by: req.user._id,
            reason,
            requested_in_time,
            requested_out_time,
            requested_status
        })
        return res.status(201).json(correction)
    }
    catch(err){
        console.log(err)
        if(err.name === 'ValidationError'){
            return res.status(400).json({message: err.message})
        }
        return res.status(500).json({message: 'Internal Server Error'})
    }
}