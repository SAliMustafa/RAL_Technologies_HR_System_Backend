const router = require("express").Router()
const verifyToken = require('../middleware/verifyToken')
const validateObjectId = require('../middleware/validateObjectId')
const {verifyHrAdmin} = require('../middleware/verifyRole')
const {createLeaveType, getAllLeaveTypes, getLeaveTypeById, unpdateLeaveType, deactivateLeaveType} = require('../controllers/leavetype.controller')

router.post("/", verifyToken, createLeaveType)

router.get("/", verifyToken, getAllLeaveTypes)

router.get("/:id", verifyToken, validateObjectId, getLeaveTypeById)

router.put("/:id", verifyToken, validateObjectId, unpdateLeaveType) 

router.delete("/:id", verifyToken, validateObjectId, deactivateLeaveType)

module.exports = router
