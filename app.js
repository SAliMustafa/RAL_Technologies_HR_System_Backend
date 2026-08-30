// imports
const express = require("express") //importing express package
const app = express() // creates a express application
const dotenv = require("dotenv").config() //this allows me to use my .env values in this file
const morgan = require('morgan')
const cors = require('cors')

// Routes Import
const authRoutes = require('./routes/auth.routes')
const departmentRoutes = require('./routes/department.routes')
const leaveTypeRoutes = require('./routes/leavetype.routes')
const leaveAllocationRoutes = require('./routes/leaveallocation.routes')
const EmployeeDocumentRoutes =require("./routes/employeeDocument.routes")
const EmployeeRoutes =require("./routes/employee.routes")
const leaveRequestRoutes = require('./routes/leaveRequest.routes')
const checkInRoutes =require("./routes/checkIn.routes")
const attendanceRoutes = require('./routes/attendance.routes')
const attendanceCorrectionRoutes = require('./routes/attendanceCorrection.routes')
const holidayRoutes = require('./routes/holiday.routes')


// Middleware
app.use(
    cors({
        origin: process.env.CLIENT_URL || 'http://localhost:5173',
    })
);
app.use(express.json())
app.use(morgan('dev'))



// Routes
app.use('/auth',authRoutes)
app.use('/departments', departmentRoutes)
app.use('/leave', leaveTypeRoutes)
app.use('/leave-allocation', leaveAllocationRoutes)
app.use('/documents', EmployeeDocumentRoutes)
app.use('/Employees', EmployeeRoutes)
app.use('/leave-request', leaveRequestRoutes)
app.use('/checkIn', checkInRoutes)
app.use('/attendance', attendanceRoutes)
app.use('/attendance-corrections', attendanceCorrectionRoutes)
app.use('/holidays', holidayRoutes)



module.exports = app