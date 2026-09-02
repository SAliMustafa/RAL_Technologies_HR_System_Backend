const router = require('express').Router()
const verifyToken = require("../middleware/verifyToken")
const validateObjectId = require("../middleware/validateObjectId")
const verifyRole = require("../middleware/verifyRole")
const attendanceController = require("../controllers/attendance.controller")

// ================= EMPLOYEE =================

// Get my attendance history
router.get(
  "/my-attendance",
  verifyToken,
  attendanceController.getMyAttendance
);

// Get my attendance for today
router.get(
  "/my-attendance/today",
  verifyToken,
  attendanceController.getTodayAttendance
);


// ================= MANAGER =================

// Get attendance for manager's team
router.get(
  "/team",
  verifyToken,
  verifyRole.verifyManager,
  attendanceController.getTeamAttendance
);

//Get my attendance by ID
router.get(
  "/:id",
  verifyToken,
  validateObjectId,
  attendanceController.getAttendanceById
);


// ================= HR ADMIN =================

// Get all attendance records
router.get(
  "/",
  verifyToken,
  verifyRole.verifyHrAdmin,
  attendanceController.getAllAttendance
);

// Get all today's attendance records
router.get(
  "/today",
  verifyToken,
  verifyRole.verifyHrAdmin,
  attendanceController.getTodayAllAttendance
);

// Get attendance history for one employee using userId
router.get(
  "/employee/:userId",
  verifyToken,
  verifyRole.verifyHrAdmin,
  attendanceController.getEmployeeAttendance
);

// Update / correct attendance
router.put(
  "/:id",
  verifyToken,
  verifyRole.verifyHrAdmin,
  attendanceController.updateAttendance
);

// Lock attendance after HR review
router.put(
  "/:attendanceId/lock",
  verifyToken,
  verifyRole.verifyHrAdmin,
  attendanceController.lockAttendance
);

// Get one attendance record by ID
router.get(
  "/:attendanceId",
  verifyToken,
  verifyRole.verifyHrAdmin,
  attendanceController.getAttendanceById
);
module.exports = router