const mongoose = require("mongoose");
const Employee = require("../models/Employee");
const User = require('../models/User')
const bcrypt = require('bcrypt')
const AuditLog = require("../models/AuditLog")


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
      department,
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
      department,
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
      department: employee.department,
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




async function getEmployeeById(req, res) {
  try {
    const { employeeId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      return res.status(400).json({ error: "invalid employee id" });
    }
    const employee = await Employee.findById(employeeId)
      .populate("reports_to", "name_en name_ar employee_code")
      .populate("user", "username role");
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }
    res.status(200).json(employee);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

async function updateEmployee(req, res) {
  try {
    const { employeeId } = req.params;
    if (!mongoose.Types.ObjectId.isValid(employeeId)) {
      return res.status(400).json({ error: "Employee not found" });
    }
    const employee = await Employee.findById(employeeId);
    if (!employee) {
      return res.status(404).json({ error: "Employee not found in record" });
    }
    const { status } = req.body;
    if (
      status &&
      !["active", "on_leave", "suspended", "left"].includes(status)
    ) {
      return res.status(400).json({ error: "invalid status value" });
    }

    Object.assign(employee, req.body);

    if (status === "left" && !req.body.date_of_leaving) {
      employee.date_of_leaving = new Date();
    }
    await employee.save();
    res.status(200).json(employee);
  } catch (err) {
    if (err.code === 11000) {
      return res.status(409).json({ error: 'employee code or cpr number already exists' })
    }
    if (err.name === 'ValidationError') {
      return res.status(400).json({ error: err.message })
    }
    res.status(500).json({ error: err.message })
  }
}

async function linkUserAccount(req, res) {
  try {
    const { employeeId } = req.params
    const { userId } = req.body
    if (!mongoose.Types.ObjectId.isValid(employeeId) || !mongoose.Types.ObjectId.isValid(userId)) {
      return res.status(400).json({ error: 'invalid employee id or user id' })
    }
    const employee = await Employee.findById(employeeId)
    if (!employee) {
      return res.status(404).json({ error: 'employee not found' })
    }
    employee.user = userId
    await employee.save()
    res.status(200).json(employee)
  } catch (err) {
    res.status(500).json({ error: err.message })
  }
}

module.exports = {
  createEmployee,
  
  getEmployeeById,
  updateEmployee,
  linkUserAccount
}