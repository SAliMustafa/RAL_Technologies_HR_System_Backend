const mongoose = require("mongoose");
require("dotenv").config();

const Department = require("./models/Department");
const Employee = require("./models/Employee");
const LeaveType = require("./models/LeaveType");
const LeaveAllocation = require("./models/LeaveAllocation");
const Holiday = require("./models/Holiday");
const User = require("./models/User");
const employees = require("./seed-data/employees.json");
const leaveTypes = require("./seed-data/leave-types.json");
const holidays = require("./seed-data/holidays.json");

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

// Generated department-manager mapping for this capstone demo.
const DEPARTMENT_MANAGERS = {
  "MANAGEMENT": "EMP-0001",
  "HUMAN RESOURCES": "EMP-0002",
  "OPERATIONS": "EMP-0003",
  "SALES": "EMP-0004",
  "FINANCE": "EMP-0005",
  "WAREHOUSE": "EMP-0014",
};

async function saveOrCreate(Model, query, values) {
  let doc = await Model.findOne(query);
  if (!doc) doc = new Model();
  Object.assign(doc, values);
  await doc.save();
  return doc;
}

async function seedDepartments() {
  const names = [...new Set(employees.map((e) => e.department.toUpperCase()))];

  const map = new Map();
  for (const name of names) {
    const department = await saveOrCreate(
      Department,
      { name },
      { name }
    );
    map.set(name, department);
  }

  console.log(`✅ Departments: ${map.size}`);
  return map;
}

async function seedEmployees(departmentMap) {
  const employeeMap = new Map();

  // Pass 1: create/update every employee without reports_to.
  for (const row of employees) {
    const department = departmentMap.get(row.department.toUpperCase());

    const values = {
      employee_code: row.employee_code,
      name_en: row.name_en,
      name_ar: row.name_ar,
      cpr_number: row.cpr_number,
      date_of_birth: new Date(row.date_of_birth),
      gender: row.gender,
      nationality: row.nationality,
      is_bahraini: row.is_bahraini,
      department_id: department?._id,
      job_title: row.job_title,
      date_of_joining: new Date(row.date_of_joining),
      employment_type: row.employment_type,
      status: row.status,
      iban: row.iban,
      bank_name: row.bank_name,
      mobile: row.mobile,
    };

let employee = await Employee.findOne({
  employee_code: row.employee_code
});

if (!employee) {
  employee = new Employee();
}

Object.assign(employee, values);

// Reset old probation data that may already exist in shared MongoDB
employee.probation_extended_with_consent = false;
employee.probation_end_date = undefined;

await employee.save();

employeeMap.set(row.employee_code, employee);

    employeeMap.set(row.employee_code, employee);
  }

  // Pass 2: now that all employees exist, connect reports_to ObjectIds.
  for (const row of employees) {
    const employee = employeeMap.get(row.employee_code);
    const manager = row.reports_to_code
      ? employeeMap.get(row.reports_to_code)
      : null;

    employee.reports_to = manager ? manager._id : null;
    await employee.save();
  }

  // Pass 3: connect each department to its manager.
  for (const [departmentName, managerCode] of Object.entries(DEPARTMENT_MANAGERS)) {
    const department = departmentMap.get(departmentName);
    const manager = employeeMap.get(managerCode);

    if (department && manager) {
      department.manager_id = manager._id;
      await department.save();
    }
  }

  console.log(`✅ Employees: ${employeeMap.size}`);
  console.log("✅ Employee manager relationships linked");
  console.log("✅ Department managers linked");

  return employeeMap;
}

async function seedLeaveTypes() {
  const leaveTypeMap = new Map();

  // Pass 1: create/update all leave types without next_leave_type_id.
  for (const row of leaveTypes) {
    const values = {
      leave_type_name: row.leave_type_name,
      max_days_per_year: row.max_days_per_year,
      pay_fraction: row.pay_fraction,
      requires_service_months: row.requires_service_months,
      requires_document: row.requires_document,
      carry_forward: row.carry_forward,
      counts_toward_service: row.counts_toward_service,
      once_per_lifetime: row.once_per_lifetime,
      gender_restriction: row.gender_restriction,
      is_active: row.is_active,
    };

    const leaveType = await saveOrCreate(
      LeaveType,
      { leave_type_name: row.leave_type_name },
      values
    );

    leaveTypeMap.set(row.leave_type_name, leaveType);
  }

  // Pass 2: connect the sick/maternity chains by ObjectId.
  for (const row of leaveTypes) {
    const leaveType = leaveTypeMap.get(row.leave_type_name);

    if (row.next_leave_type_name) {
      const nextType = leaveTypeMap.get(row.next_leave_type_name);
      if (!nextType) {
        throw new Error(
          `Could not find next leave type "${row.next_leave_type_name}" for "${row.leave_type_name}"`
        );
      }
      leaveType.next_leave_type_id = nextType._id;
    } else {
      leaveType.next_leave_type_id = undefined;
    }

    await leaveType.save();
  }

  console.log(`✅ Leave types: ${leaveTypeMap.size}`);
  return leaveTypeMap;
}

async function seedAnnualAllocations(employeeMap, leaveTypeMap) {
  const annualLeave = leaveTypeMap.get("Annual Leave");
  if (!annualLeave) throw new Error("Annual Leave was not created.");

  const periodStart = new Date("2026-01-01T00:00:00.000Z");
  const periodEnd = new Date("2026-12-31T23:59:59.999Z");

  let count = 0;

  for (const employee of employeeMap.values()) {
    if (employee.status !== "active") continue;

    let allocation = await LeaveAllocation.findOne({
      employee_id: employee._id,
      leave_type_id: annualLeave._id,
      period_start: periodStart,
    });

    if (!allocation) {
      allocation = new LeaveAllocation({
        employee_id: employee._id,
        leave_type_id: annualLeave._id,
        period_start: periodStart,
        period_end: periodEnd,
        days_allocated: annualLeave.max_days_per_year,
        days_carried_forward: 0,
        days_taken: 0,
      });
    } else {
      // Keep days_taken if the app has already been used.
      allocation.period_end = periodEnd;
      allocation.days_allocated = annualLeave.max_days_per_year;
      allocation.days_carried_forward =
        allocation.days_carried_forward ?? 0;
    }

    await allocation.save();
    count += 1;
  }

  console.log(`✅ 2026 Annual Leave allocations: ${count}`);
}

async function seedHolidays() {
  let count = 0;

  for (const row of holidays) {
    const from = new Date(`${row.from_date}T00:00:00.000Z`);
    const to = new Date(`${row.to_date}T00:00:00.000Z`);

    await saveOrCreate(
      Holiday,
      {
        from_date: from,
        to_date: to,
        description: row.description,
      },
      {
        from_date: from,
        to_date: to,
        description: row.description,
        is_confirmed: row.is_confirmed,
      }
    );

    count += 1;
  }

  console.log(`✅ Holidays: ${count}`);
}
async function seedUsers(employeeMap) {
const bcrypt = require("bcrypt");
  const password = await bcrypt.hash("demo123", 10);

  const users = [
    {
      username: "employee",
      role: "employee",
      employee_code: "EMP-0016",
    },
    {
      username: "manager",
      role: "manager",
      employee_code: "EMP-0003",
    },
    {
      username: "hr",
      role: "hr_admin",
      employee_code: "EMP-0002",
    },
 {
    username: "emp0001",
    role: "manager",
    employee_code: "EMP-0001", // Yousif Al Mahmood - General Manager
  },
  {
    username: "emp0004",
    role: "manager",
    employee_code: "EMP-0004", // Khalid Janahi - Sales Manager
  },
  {
    username: "emp0005",
    role: "manager",
    employee_code: "EMP-0005", // Mohammed Al Dosari - Finance manager
  },
  {
    username: "emp0006",
    role: "employee",
    employee_code: "EMP-0006", // Jassim Al Muraikhi
  },
  {
    username: "emp0007",
    role: "employee",
    employee_code: "EMP-0007", // Noora Al Sayed
  },
  {
    username: "emp0008",
    role: "employee",
    employee_code: "EMP-0008", // Hussain Al Aali
  },
  {
    username: "emp0009",
    role: "employee",
    employee_code: "EMP-0009", // Wadha Al Zayani
  },
  {
    username: "emp0010",
    role: "employee",
    employee_code: "EMP-0010", // Aisha Buheji
  },
  {
    username: "emp0011",
    role: "employee",
    employee_code: "EMP-0011", // Ahmed Hassan Ibrahim
  },
  {
    username: "emp0012",
    role: "employee",
    employee_code: "EMP-0012", // Karim Farouk Mansour
  },
  {
    username: "emp0013",
    role: "employee",
    employee_code: "EMP-0013", // Maria Santos Cruz
  },
  {
    username: "emp0014",
    role: "manager",
    employee_code: "EMP-0014", // Suresh Babu Reddy - Warehouse Supervisor
  },
  {
    username: "emp0015",
    role: "employee",
    employee_code: "EMP-0015", // Rajesh Kumar Nair
  },
  {
    username: "emp0017",
    role: "employee",
    employee_code: "EMP-0017", // Imran Sheikh
  },
  {
    username: "emp0018",
    role: "employee",
    employee_code: "EMP-0018", // Muhammad Aslam
  },
  {
    username: "emp0019",
    role: "employee",
    employee_code: "EMP-0019", // Ranjith Wickramasinghe
  },
  {
    username: "emp0020",
    role: "employee",
    employee_code: "EMP-0020", // Grace Wanjiru
  }
  ];

  for (const data of users) {
    const employee = employeeMap.get(data.employee_code);

    if (!employee) {
      throw new Error(`Employee ${data.employee_code} not found`);
    }

    let user = await User.findOne({
      username: data.username,
    });

    if (!user) {
      user = new User();
    }

    user.username = data.username;
    user.hashedPassword = password;
    user.role = data.role;
    user.employeeId = employee._id;

    await user.save();
  }

  console.log("✅ Demo users: 3");
}
async function main() {
  if (!MONGODB_URI) {
    throw new Error(
      "MONGODB_URI is missing. Put it in backend/.env before running the seed."
    );
  }

  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected to MongoDB");

  const departmentMap = await seedDepartments();
  const employeeMap = await seedEmployees(departmentMap);
  const leaveTypeMap = await seedLeaveTypes();
  await seedAnnualAllocations(employeeMap, leaveTypeMap);
  await seedHolidays();
await seedUsers(employeeMap);
  console.log("");
  console.log("🎉 Seed complete");
  console.log("");
  console.log("Demo leave relationship:");
  console.log("  Ali Haidar Suleiman (EMP-0016)");
  console.log("      reports to");
  console.log("  Abdulla Al Khalifa (EMP-0003)");
}

main()
  .catch((err) => {
    console.error("❌ Seed failed");
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
