const mongoose = require("mongoose");
const Employee = require("../models/Employee");
const User = require('../models/User')
const bcrypt = require('bcrypt')
const AuditLog = require("../models/AuditLog")



async function getMyProfile(req, res) {
  try {
    const userId = req.user._id

    const user = await User.findById(userId).populate('employeeId')
    if (!user) {
      return res.status(404).json({ error: 'user not found' })
    }

    res.status(200).json(user);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}



async function updateMyContact(req, res) {
  try {
    const userId = req.user._id

    const user = await User.findById(userId)
    const employeeId = user.employeeId
    const { mobile, email_personal } = req.body

    if (!mobile || !email_personal) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const updatemContact = await Employee.findByIdAndUpdate(employeeId, {
      mobile,
      email_personal
    }, {
      new: true,
      runValidators: true
    })

    res.status(200).json(updatemContact);
  } catch (err) {

    res.status(500).json({ error: err.message })
  }
}




async function createEmployee(req, res) {

  try {

    const {
      username,
      password,
      role,

      employee_code,
      name_en,
      name_ar,
      cpr_number,
      date_of_birth,
      gender,
      nationality,
      is_bahraini,
      department_id,
      job_title,
      reports_to,
      date_of_joining,
      probation_end_date,
      probation_extended_with_consent,
      employment_type,
      status,
      date_of_leaving,
      iban,
      bank_name,
      mobile,
      email_personal,
      email_work
    } = req.body;

    if (!username || !password) {

      return res.status(400).json({
        error: "username and password are required"
      });
    }



    const employee = await Employee.create({

      employee_code,
      name_en,
      name_ar,
      cpr_number,
      date_of_birth,
      gender,
      nationality,
      is_bahraini,
      department_id,
      job_title,
      reports_to,
      date_of_joining,
      probation_end_date,
      probation_extended_with_consent,
      employment_type,
      status,
      date_of_leaving,
      iban,
      bank_name,
      mobile,
      email_personal,
      email_work


    }
    )




    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      username,
      hashedPassword,
      role: role || "employee",
      employeeId: employee._id
    });

    const employeeFields = {
      employee_code: employee.employee_code,
      name_en: employee.name_en,
      name_ar: employee.name_ar,
      cpr_number: employee.cpr_number,
      date_of_birth: employee.date_of_birth,
      gender: employee.gender,
      nationality: employee.nationality,
      is_bahraini: employee.is_bahraini,
      department: employee.department_id,
      job_title: employee.job_title,
      reports_to: employee.reports_to,
      date_of_joining: employee.date_of_joining,
      probation_end_date: employee.probation_end_date,
      employment_type: employee.employment_type,
      status: employee.status,
      iban: employee.iban,
      bank_name: employee.bank_name,
      mobile: employee.mobile,
      email_personal: employee.email_personal,
      email_work: employee.email_work
    };

    const userFields = {
      username: user.username,
      role: user.role,
      employeeId: user.employeeId
    };

    const auditLogs = [];

    for (const [field_name, value] of Object.entries(employeeFields)) {
      if (value !== undefined && value !== null) {
        auditLogs.push({
          table_name: "Employee",
          record_id: employee._id.toString(),
          action: "create",
          changed_by: req.user._id,
          field_name,
          old_value: null,
          new_value: value.toString(),
          ip_address: req.ip
        });
      }
    }

    for (const [field_name, value] of Object.entries(userFields)) {
      if (value !== undefined && value !== null) {
        auditLogs.push({
          table_name: "User",
          record_id: user._id.toString(),
          action: "create",
          changed_by: req.user._id,
          field_name,
          old_value: null,
          new_value: value.toString(),
          ip_address: req.ip
        });
      }
    }

    await AuditLog.insertMany(auditLogs);


    return res.status(201).json({
      message: "Employee and user created successfully",
      employee,
      user
    });

  } catch (err) {
    console.log(err)

    if (err.code === 11000) {
      return res.status(409).json({
        error: "Username, employee code, CPR number, or employee account already exists"
      });
    }

    if (err.name === "ValidationError") {
      return res.status(400).json({
        error: err.message
      });
    }
    console.log(err)
    return res.status(500).json({
      error: err.message
    });

  }
}


async function getAllEmployees(req, res) {
  try {

    const users = await User.find({ role: { $in: ["employee", "manager"] } }).populate("employeeId")

    res.status(200).json(users);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}


async function getEmployeeById(req, res) {
  try {
    const { userId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "invalid employee id" });
    }

    const user = await User.findById(userId).populate('employeeId')
    if (!user) {
      return res.status(404).json({ error: 'user not found' })
    }

    res.status(200).json(user);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}


async function updateEmployeeByHrAdmin(req, res) {
  try {
    const { userId } = req.params;
    const changed_by = req.user._id;

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


    const employee = await Employee.findById(user.employeeId);

    const auditLogs = [];

    const allowedUserFields = ["username", "role"];

    if (req.body.role && !["employee", "manager", "hr_admin"].includes(req.body.role)) {
      return res.status(400).json({ error: "Invalid role" });
    }

    for (const field of allowedUserFields) {

      if (req.body[field] !== undefined) {

        const oldValue = user[field];
        const newValue = req.body[field];

        if (String(oldValue) !== String(newValue)) {

          auditLogs.push({
            table_name: "User",
            record_id: user._id.toString(),
            action: "update",
            changed_by,
            field_name: field,
            old_value: String(oldValue ?? ""),
            new_value: String(newValue),
            ip_address: req.ip
          });

          user[field] = newValue;
        }
      }
    }


    const allowedEmployeeFields = [
      "employee_code",
      "name_en",
      "name_ar",
      "cpr_number",
      "date_of_birth",
      "gender",
      "nationality",
      "is_bahraini",
      "department_id",
      "job_title",
      "reports_to",
      "date_of_joining",
      "probation_end_date",
      "probation_extended_with_consent",
      "employment_type",
      "status",
      "date_of_leaving",
      "iban",
      "bank_name",
      "mobile",
      "email_personal",
      "email_work"
    ];

    if (req.body.reports_to && reports_to.toString() === employeeId.toString()) {
      return res.status(400).json({
        error: "Employee cannot report to themselves"
      });
    }


    for (const field of allowedEmployeeFields) {

      if (req.body[field] !== undefined) {

        const oldValue = employee[field];
        const newValue = req.body[field];

        if (String(oldValue) !== String(newValue)) {

          auditLogs.push({
            table_name: "Employee",
            record_id: employee._id.toString(),
            action: "update",
            changed_by,
            field_name: field,
            old_value: String(oldValue ?? ""),
            new_value: String(newValue),
            ip_address: req.ip
          });

          employee[field] = newValue;
        }
      }
    }

    if (req.body.status === "left" && !req.body.date_of_leaving) {
      const oldLeavingDate = employee.date_of_leaving;

      employee.date_of_leaving = new Date();

      auditLogs.push({
        table_name: "Employee",
        record_id: employee._id.toString(),
        action: "update",
        changed_by,
        field_name: "date_of_leaving",
        old_value: oldLeavingDate
          ? oldLeavingDate.toString()
          : "",
        new_value: employee.date_of_leaving.toString(),
        reason: "Employee status changed to left",
        ip_address: req.ip
      });
    }
    await user.validate();
    await employee.validate();

    await user.save();
    await employee.save();

    if (auditLogs.length > 0) {
      await AuditLog.insertMany(auditLogs);
    }

    return res.status(200).json({
      message: "User and employee updated successfully",
      user,
      employee
    });



  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}



async function updateEmployeeStatus(req, res) {
  try {
    const { userId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: "invalid employee id" });
    }

    const user = await User.findById(userId).populate('employeeId')

    if (!user) {
      return res.status(404).json({ error: 'user not found' })
    }

    const changed_by = req.user._id;
    const { status } = req.body


    if (!status) {
      return res.status(400).json({
        error: "Status is required"
      });
    }


    if (status && !["active", "on_leave", "suspended", "left"].includes(status)
    ) { return res.status(400).json({ error: "Invalid employee status" }); }

    const employee = user.employeeId;

    if (employee.status === status) {
      return res.status(400).json({
        error: `Employee status is already ${status}`
      });
    }

    const oldStatus = employee.status;
    
    employee.status = status;


    if (status === "left" && !employee.date_of_leaving) {
      employee.date_of_leaving = new Date();
    }

    await employee.save();

    await AuditLog.create({
      table_name: "Employee",
      record_id: employee._id.toString(),
      action: "update",
      changed_by,
      field_name: "status",
      old_value: oldStatus,
      new_value: status,
      ip_address: req.ip
    });

    return res.status(200).json({
      message: "Employee status updated successfully",
      user
    });

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function getTeamEmployees(req, res) {
  try {
    const userId = req.user._id
     
    const user = await User.findById(userId).populate('employeeId')
    
    const findteam= await Employee.find({reports_to: user.employeeId._id})

    res.status(200).json(findteam);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
async function getAllEmployeeDepartment(req, res) {
  try {
    const userId = req.user._id
     
    const user = await User.findById(userId).populate('employeeId')
    
    const findteam= await Employee.find({department_id: user.employeeId.department_id})

    res.status(200).json(findteam);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}



module.exports = {
  createEmployee,
  getMyProfile,
  getEmployeeById,
  updateMyContact,
  getAllEmployees,
  updateEmployeeByHrAdmin,
  updateEmployeeStatus,
  getTeamEmployees,
  getAllEmployeeDepartment


}
