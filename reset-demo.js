const mongoose = require("mongoose");
require("dotenv").config();

const Employee = require("./models/Employee");
const LeaveType = require("./models/LeaveType");
const LeaveAllocation = require("./models/LeaveAllocation");
const LeaveRequest = require("./models/LeaveRequest");

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;

async function main() {
  if (!MONGODB_URI) {
    throw new Error(
      "MONGODB_URI is missing. Put it in backend/.env before running this script."
    );
  }

  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected to MongoDB");

  const employee = await Employee.findOne({ employee_code: "EMP-0016" });
  const annualLeave = await LeaveType.findOne({ leave_type_name: "Annual Leave" });

  if (!employee) throw new Error("EMP-0016 (Ali Haidar Suleiman) was not found.");
  if (!annualLeave) throw new Error("Annual Leave was not found.");

  // Only clear the demo employee's leave requests — this does NOT wipe the team DB.
  const requestResult = await LeaveRequest.deleteMany({
    employee_id: employee._id,
  });

  const allocation = await LeaveAllocation.findOne({
    employee_id: employee._id,
    leave_type_id: annualLeave._id,
    period_start: new Date("2026-01-01T00:00:00.000Z"),
  });

  if (!allocation) {
    throw new Error(
      "Ali's 2026 Annual Leave allocation was not found. Run node seed.js first."
    );
  }

  allocation.days_taken = 0;
  allocation.days_carried_forward = 0;
  allocation.days_allocated = annualLeave.max_days_per_year;
  await allocation.save();

  console.log(`✅ Deleted ${requestResult.deletedCount} leave request(s) for demo employee`);
  console.log(`✅ Annual Leave reset to ${allocation.days_allocated} days`);
  console.log("🎬 Leave demo is ready again");
}

main()
  .catch((err) => {
    console.error("❌ Demo reset failed");
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
