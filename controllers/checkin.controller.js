const Checkin = require("../models/Checkin")
const Attendance = require('../models/Attendance')
const User = require("../models/User")
const mongoose = require("mongoose");

async function checkIn(req, res) {
    try {
        const userId = req.user._id
        const user = await User.findById(userId)
        const employeeId = user.employeeId

        const in_time = new Date();

        const attendanceDate = new Date(in_time);
        attendanceDate.setHours(0, 0, 0, 0);

        const openShiftTime = new Date(attendanceDate);
        openShiftTime.setHours(7, 0, 0, 0);

        if (in_time < openShiftTime) {

            const checkIn = await Checkin.create({
                employee_id: employeeId,
                timestamp: in_time,
                log_type: "IN",
                source: "web",
                attendance_id: null
            });

            return res.status(201).json({
                message: "Check-in recorded, but shift has not opened yet",
                checkIn
            });
        }



        let attendance = await Attendance.findOne({
            employee_id: employeeId,
            date: attendanceDate
        });

        if (attendance) {
            return res.status(409).json({
                error: "Employee already checked in today"
            });
        }

        const lateTime = new Date(attendanceDate);
        lateTime.setHours(8, 15, 0, 0);


        let is_late_entry = false


        if (in_time > lateTime) {
            is_late_entry = true;
        }

        const createAttendance = await Attendance.create({
            employee_id: employeeId,
            date: attendanceDate,
            in_time,
            is_late_entry,
            is_incomplete: true,
            status: "pending"
        })

        const checkIn = await Checkin.create({
            employee_id: employeeId,
            timestamp: in_time
            , log_type: "IN"
            , source: "web"
            , attendance_id: createAttendance._id
        })

        return res.status(201).json({
            message: " checkIn in successfully",
            attendance:createAttendance,
            checkIn
        });


    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });

    }

}


async function checkOut(req, res) {
    try {
        const userId = req.user._id
        const user = await User.findById(userId)

        const employeeId = user.employeeId

        const out_time = new Date();

        const attendanceDate = new Date(out_time);
        attendanceDate.setHours(0, 0, 0, 0);

        let attendance = await Attendance.findOne({
            employee_id: employeeId,
            date: attendanceDate
        });

        if (!attendance) {
            return res.status(400).json({
                error: "Employee has not checked in today"
            });
        }

        if (attendance.out_time) {
            return res.status(409).json({
                error: "Employee already checked out today"
            });
        }

        const earlyExitTime = new Date(attendanceDate);
        earlyExitTime.setHours(16, 45, 0, 0);

        let is_early_exit = false;

        if (out_time < earlyExitTime) {
            is_early_exit = true;
        }

        const millisecondsWorked = out_time.getTime() - attendance.in_time.getTime();

        let worked_hours = millisecondsWorked / (1000 * 60 * 60);


        //  break
        worked_hours = worked_hours - 1;

        if (worked_hours < 0) {
            worked_hours = 0;
        }


        let status = "present";

        if (worked_hours < 2) {
            status = "absent";
        } else if (worked_hours < 4) {
            status = "half_day";
        }




        const checkOut = await Checkin.create({
            employee_id: employeeId,
            timestamp: out_time,
            log_type: "OUT",
            source: "web",
            attendance_id: attendance._id
        });


      


        attendance.out_time = out_time;
        attendance.worked_hours = worked_hours;
        attendance.status = status;
        attendance.is_early_exit = is_early_exit;
        attendance.is_incomplete = false;

       
        await attendance.save()

        return res.status(200).json({
            message: "Checked out successfully",
            attendance,
            checkOut
        });




    } catch (error) {
        console.log(error);
        res.status(500).json({ message: error.message });

    }

}


async function getMyCheckins(req, res) {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);


    const employeeId = user.employeeId;

    const checkins = await Checkin.find({employee_id: employeeId}).sort({ timestamp: -1 }).populate("attendance_id");

    return res.status(200).json(checkins);

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: error.message
    });
  }
}


async function getTodayCheckins(req, res) {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);

    if (!user || !user.employeeId) {
      return res.status(404).json({
        error: "Employee not found"
      });
    }

    const employeeId = user.employeeId;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);

    const checkins = await Checkin.find({
      employee_id: employeeId,
      timestamp: { $gte: today, $lt: tomorrow } 
       }).sort({ timestamp: 1 });

    return res.status(200).json(checkins);

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      error: error.message
    });
  }
}


async function getAllCheckins(req, res) {
  try {
 
const checkins = await Checkin.find()
      .sort({ timestamp: -1 })
      .populate("employee_id")
      .populate("attendance_id");

    return res.status(200).json(checkins);

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: error.message
    });
  }
}

async function getEmployeeCheckins(req, res) {
  try {
    const {userId} = req.params;


    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({
        error: "Invalid user id"
      });
    }

    const user = await User.findById(userId);


    if (!user) {
      return res.status(404).json({
        error: "User not found"
      });
    }
    if (!user.employeeId) {
      return res.status(404).json({
        error: "Employee not found"
      });
    }


    const employeeId = user.employeeId;

    const checkins = await Checkin.find({employee_id: employeeId})
    .sort({ timestamp: -1 })
    .populate("attendance_id");

    return res.status(200).json(checkins);

  } catch (error) {
    console.log(error);
    return res.status(500).json({
      error: error.message
    });
  }
}





module.exports = {
    checkIn
    ,checkOut
    ,getMyCheckins
    ,getTodayCheckins
    ,getEmployeeCheckins
   ,getAllCheckins
}
