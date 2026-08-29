const router = require("express").Router()
const verifyToken = require("../middleware/verifyToken")
const { createLeaveRequest } = require("../controllers/leaverequest.controller")

router.post("/", verifyToken, createLeaveRequest)

module.exports = router
