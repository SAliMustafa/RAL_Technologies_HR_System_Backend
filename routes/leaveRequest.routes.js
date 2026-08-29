const router = require("express").Router()
const verifyToken = require("../middleware/verifyToken")
const { createLeaveRequest, updateLeaveRequest, submitLeaveRequest, approveLeaveRequest, rejectLeaveRequest } = require("../controllers/leaverequest.controller")

router.post("/", verifyToken, createLeaveRequest)
router.put('/:id', verifyToken, updateLeaveRequest)
router.put('/:id/submit', verifyToken, submitLeaveRequest)
router.put('/:id/approve', verifyToken, approveLeaveRequest)
router.put('/:id/reject', verifyToken, rejectLeaveRequest)


module.exports = router
