const Attendance = require('../models/Attendance')
const Employee = require('../models/Employee')
const User = require('../models/User')


async function createAttendance(req,res){
    try{
        const {employee_id, date, status, in_time, out_time} = req.body

        if(!employee_id || !date || !status){
            return res.status(400).json({
                message: 'employee_id, date and status are required.'
            })
        }

        const attendance = await Attendance.create({
            employee_id,
            date,
            status,
            in_time,
            out_time
        })
        return res.status(201).json(attendance)
    }
    catch(err){
        if(err.name === 'ValidationError'){
            return res.status(400).json({message: 'err.message'})
        }
        if (err.code === 11000){
            return res.status(409).json({
                message: 'An attendance record already exists for this employee on this date.'
            })
        }
        return res.status(500).json({message: 'Internal Server Error'})
    }
}