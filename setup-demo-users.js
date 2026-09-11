const mongoose = require("mongoose");
require("dotenv").config();

const Employee = require("./models/Employee");
const User = require("./models/User");

const MONGODB_URI = process.env.MONGODB_URI || process.env.MONGO_URI;
const DEMO_PASSWORD = process.env.DEMO_PASSWORD || "demo123";

const DEMO_USERS = [
  { username: "employee", role: "employee", employee_code: "EMP-0016" }, // Ali Haidar Suleiman
  { username: "manager", role: "manager", employee_code: "EMP-0003" },   // Abdulla Al Khalifa
  { username: "hr", role: "hr_admin", employee_code: "EMP-0002" },      // Fatima Al Alawi
];

function getBcrypt() {
  try {
    return require("bcryptjs");
  } catch (_) {
    try {
      return require("bcrypt");
    } catch (_) {
      throw new Error(
        'No bcrypt package found. Run "npm install bcryptjs" and try again.'
      );
    }
  }
}

async function main() {
  if (!MONGODB_URI) {
    throw new Error(
      "MONGODB_URI is missing. Put it in backend/.env before running this script."
    );
  }

  await mongoose.connect(MONGODB_URI);
  console.log("✅ Connected to MongoDB");

  const bcrypt = getBcrypt();
  const hashedPassword = await bcrypt.hash(DEMO_PASSWORD, 10);

  for (const demo of DEMO_USERS) {
    const employee = await Employee.findOne({ employee_code: demo.employee_code });
    if (!employee) {
      throw new Error(
        `${demo.employee_code} was not found. Run "node seed.js" first.`
      );
    }

    // Your User model makes employeeId unique.
    // If a User is already attached to this employee, this explicit setup script
    // reuses it and converts it into the intended presentation account.
    let user = await User.findOne({ employeeId: employee._id });
    if (!user) user = await User.findOne({ username: demo.username });
    if (!user) user = new User();

    user.username = demo.username;
    user.hashedPassword = hashedPassword;
    user.role = demo.role;
    user.employeeId = employee._id;
    await user.save();

    console.log(`✅ ${demo.role}: ${demo.username} → ${employee.name_en}`);
  }

  console.log("");
  console.log("Demo logins ready:");
  console.log(`  Employee → employee / ${DEMO_PASSWORD}`);
  console.log(`  Manager  → manager  / ${DEMO_PASSWORD}`);
  console.log(`  HR Admin → hr       / ${DEMO_PASSWORD}`);
  console.log("");
  console.log(
    "NOTE: this script intentionally updates/creates the User records attached to those 3 employees."
  );
}

main()
  .catch((err) => {
    console.error("❌ Demo-user setup failed");
    console.error(err);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
