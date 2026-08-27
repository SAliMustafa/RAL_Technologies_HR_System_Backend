const router = require('express').Router()
const verifyToken = require("../middleware/verifyToken")
const validateObjectId = require("../middleware/validateObjectId")
const { verifyHrAdmin } = require("../middleware/verifyRole")
const attendanceController = require("../controllers/attendance.controller")


router.post("/", verifyToken, verifyHrAdmin, attendanceController.createAttendance)
router.get("/", verifyToken, attendanceController.getAttendance)
router.get("/:id", verifyToken, validateObjectId, attendanceController.getAttendanceById)
router.put("/:id", verifyToken, verifyHrAdmin, validateObjectId, attendanceController.updateAttendance)


module.exports = router