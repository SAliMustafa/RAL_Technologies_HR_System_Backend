const router = require("express").Router()
const verifyToken = require('../middleware/verifyToken')
const validateObjectId = require('../middleware/validateObjectId')
const {verifyHrAdmin} = require('../middleware/verifyRole')
const {createLeaveType, getLeaveType} = require('../controllers/leavetype.controller')

router.post("/", verifyToken, createLeaveType)

router.get("/", verifyToken, getLeaveType)

// router.get("/:id", verifyToken, validateObjectId, )

// router.put("/:id", verifyToken, verifyHrAdmin, validateObjectId

module.exports = router
