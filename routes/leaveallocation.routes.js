const router = require("express").Router()
const verifyToken = require('../middleware/verifyToken')
const validateObjectId = require('../middleware/validateObjectId')
const {verifyHrAdmin} = require('../middleware/verifyRole')
const {createLeaveAllocation, getAllLeaveAllocations, getAllocationById} = require('../controllers/leaveallocation.controller')

router.post("/", verifyToken, createLeaveAllocation)

router.get("/", verifyToken, getAllLeaveAllocations)

router.get("/:id", verifyToken, validateObjectId, getAllocationById)

// router.put("/:id", verifyToken, validateObjectId, unpdateLeaveType) 

// router.delete("/:id", verifyToken, validateObjectId, deactivateLeaveType)

module.exports = router
