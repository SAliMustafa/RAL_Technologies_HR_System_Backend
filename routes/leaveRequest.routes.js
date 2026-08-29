const router = require("express").Router()
const verifyToken = require("../middleware/verifyToken")
const { createLeaveRequest, updateLeaveRequest, submitLeaveRequest } = require("../controllers/leaverequest.controller")

router.post("/", verifyToken, createLeaveRequest)
router.put('/:id', verifyToken, updateLeaveRequest)
router.put('/:id/submit', verifyToken, updateLeaveRequest)

module.exports = router
