const router = require("express").Router()
const verifyToken = require('../middleware/verifyToken')
const verifyRole = require('../middleware/verifyRole')

const Checkin = require('../controllers/checkin.controller')

// ================= EMPLOYEE =================

// Check in
router.post(
  "/check-in",
  verifyToken,
  Checkin.checkIn
);

// Check out
router.post(
  "/check-out",
  verifyToken,
  Checkin.checkOut
);

// Get my check-in / check-out history
router.get(
  "/my-checkins",
  verifyToken,
  Checkin.getMyCheckins
);

// Get today's check-ins
router.get(
  "/today",
  verifyToken,
  Checkin.getTodayCheckins
);


// ================= HR ADMIN =================

// Get all check-ins
router.get(
  "/",
  verifyToken,
  verifyRole.verifyHrAdmin,
  Checkin.getAllCheckins
);

// Get one employee's check-ins
router.get(
  "/employee/:userId",
  verifyToken,
  verifyRole.verifyHrAdmin,
  Checkin.getEmployeeCheckins
);
module.exports = router