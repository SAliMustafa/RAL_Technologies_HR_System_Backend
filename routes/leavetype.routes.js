const router = require("express").Router()
const verifyToken = require('../middleware/verifyToken')
const validateObjectId = require('../middleware/validateObjectId')
const {verifyHrAdmin} = require('../middleware/verifyRole')
const {createLeaveType, getAllLeaveTypes, getLeaveTypeById, updateLeaveType, deactivateLeaveType} = require('../controllers/leavetype.controller')

router.post("/", verifyToken, verifyHrAdmin, createLeaveType)

router.get("/", verifyToken, getAllLeaveTypes)

router.get("/:id", verifyToken, validateObjectId, getLeaveTypeById)

router.put("/:id", verifyToken, validateObjectId, verifyHrAdmin, updateLeaveType) 

router.delete("/:id", verifyToken, validateObjectId, verifyHrAdmin, deactivateLeaveType)

module.exports = router
