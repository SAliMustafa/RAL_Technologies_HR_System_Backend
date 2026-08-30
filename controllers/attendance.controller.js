const Attendance = require('../models/Attendance')
const Employee = require('../models/Employee')
const User = require('../models/User')
const AuditLog = require('../models/AuditLog')
const mongoose = require("mongoose");


async function getAttendanceById(req, res) {
    try {
        const attendance = await Attendance.findById(req.params.id)

        if (!attendance) {
            return res.status(404).json({ message: 'Attendance record not found.' })
        }

        const user = await User.findById(req.user._id)
        if (user.role === "employee" && String(attendance.employee_id) !== String(user.employee_id)) {
            return res.status(403).json({ message: 'This is not within your authority.' });
        }

        if (user.role === 'manager') {
            const managed = await Employee.exists({
                _id: attendance.employee_id,
                reports_to: user.employee_id
            })

            if (!managed) {
                return res.status(403).json({ message: 'This is not within your authority.' })
            }
        }
        res.status(200).json(attendance)
    }
    catch (err) {
        console.log(err)
        return res.status(500).json({ message: 'Internal Server Error' })
    }
}

async function updateAttendance(req, res) {
  try {
    const { attendanceid } = req.params;

    const {
      status,
      in_time,
      out_time,
      is_late_entry,
      is_early_exit,
      is_incomplete,
      correction_reason
    } = req.body;

    const attendance = await Attendance.findById(attendanceid);

    if (!attendance) {
      return res.status(404).json({
        message: "Attendance record not found."
      });
    }



    // if (attendance.locked) {
    //   return res.status(403).json({
    //     message: "This attendance is locked and cannot be updated."
    //   });
    // }


    if (!correction_reason) {
      return res.status(400).json({
        message: "Correction reason is required."
      });
    }


    if (
      status &&
      ![
        "Present",
        "Absent",
        "Half Day",
        "On Leave",
        "Holiday",
        "Weekly Off"
      ].includes(status)
    ) {
      return res.status(400).json({
        message: "Invalid attendance status."
      });
    }

    const allowedFields = [
      "status",
      "in_time",
      "out_time",
      "is_late_entry",
      "is_early_exit",
      "is_incomplete"
    ];

    const auditLogs = [];

  

    for (const field of allowedFields) {
      if (req.body[field] !== undefined) {

        const oldValue = attendance[field];
        const newValue = req.body[field];

        if (String(oldValue ?? "") !== String(newValue ?? "")) {

          auditLogs.push({
            table_name: "Attendance",
            record_id: attendance._id.toString(),
            action: "correct",
            changed_by: req.user._id,
            field_name: field,
            old_value: String(oldValue ?? ""),
            new_value: String(newValue ?? ""),
            reason: correction_reason,
            ip_address: req.ip
          });

          attendance[field] = newValue;
        }
      }
    }

   

    attendance.is_corrected = true;
    attendance.corrected_by = req.user._id;
    attendance.correction_reason = correction_reason;

    await attendance.save();

    if (auditLogs.length > 0) {
      await AuditLog.insertMany(auditLogs);
    }

    return res.status(200).json({
      message: "Attendance updated successfully.",
      attendance
    });

  } catch (err) {
    console.log(err);

    if (err.name === "ValidationError") {
      return res.status(400).json({
        message: err.message
      });
    }

    return res.status(500).json({
      message: "Internal Server Error"
    });
  }
}


async function getMyAttendance(req, res) {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);

    const attendance = await Attendance.find({employee_id: user.employeeId}).sort({ date: -1 });

    return res.status(200).json(attendance);

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      error: error.message
    });
  }
}

async function getTodayAttendance(req, res) {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.findOne({
      employee_id: user.employeeId,
      date: today
    });

    if (!attendance) {
      return res.status(404).json({
        message: "No attendance found for today"
      });
    }

    return res.status(200).json(attendance);

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      error: error.message
    });
  }
}


async function getTeamAttendance(req, res) {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId);

   

    const managerEmployeeId = user.employeeId;

    const teamEmployees = await Employee.find({
      reports_to: managerEmployeeId
    }).select("_id");

    const employeeIds = teamEmployees.map(
      employee => employee._id
    );

    const attendance = await Attendance.find({
      employee_id: {
        $in: employeeIds
      }
    })
      .populate(
        "employee_id",
        "employee_code name_en name_ar department_id job_title"
      )
      .sort({ date: -1 });

    return res.status(200).json(attendance);

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      error: error.message
    });
  }
}

async function getTodayAllAttendance(req, res) {
  try {

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const attendance = await Attendance.find({
      date: today
    })
      .populate(
        "employee_id",
        "employee_code name_en name_ar department_id job_title"
      )
      .sort({ in_time: 1 });

    return res.status(200).json(attendance);

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      error: error.message
    });
  }
}
async function getEmployeeAttendance(req, res) {
  try {
    const { userId } = req.params;

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

    const attendance = await Attendance.find({
      employee_id: user.employeeId
    }).sort({ date: -1 });

    return res.status(200).json(attendance);

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      error: error.message
    });
  }
}

async function getAllAttendance(req, res) {
  try {

    const {status,employee_id,date} = req.query;

    const filter = {};

    if (status) {
      filter.status = status;
    }

    if (employee_id) {
      filter.employee_id = employee_id;
    }

    if (date) {
      const attendanceDate = new Date(date);
      attendanceDate.setHours(0, 0, 0, 0);

      filter.date = attendanceDate;
    }

    const attendance = await Attendance.find(filter)
      .populate(
        "employee_id",
        "employee_code name_en name_ar department_id job_title"
      )
      .sort({ date: -1 });

    return res.status(200).json(attendance);

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      error: error.message
    });
  }
}

async function lockAttendance(req, res) {
  try {
    const { attendanceId } = req.params;
    const changed_by = req.user._id;

    if (!mongoose.Types.ObjectId.isValid(attendanceId)) {
      return res.status(400).json({
        error: "Invalid attendance id"
      });
    }

    const attendance = await Attendance.findById(attendanceId);

    if (!attendance) {
      return res.status(404).json({
        error: "Attendance not found"
      });
    }

    if (attendance.locked) {
      return res.status(409).json({
        error: "Attendance is already locked"
      });
    }

    attendance.locked = true;

    await attendance.save();

    await AuditLog.create({
      table_name: "Attendance",
      record_id: attendance._id.toString(),
      action: "update",
      changed_by,
      field_name: "locked",
      old_value: "false",
      new_value: "true",
      reason: "Attendance locked for payroll",
      ip_address: req.ip
    });

    return res.status(200).json({
      message: "Attendance locked successfully",
      attendance
    });

  } catch (error) {
    console.log(error);

    return res.status(500).json({
      error: error.message
    });
  }
}


module.exports = {
    lockAttendance,
    getMyAttendance,
    getTodayAttendance,
    getAttendanceById,
    getEmployeeAttendance,
    getAllAttendance,
    updateAttendance,
    getTodayAllAttendance,
    getTeamAttendance

}