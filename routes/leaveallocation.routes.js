const router = require("express").Router()
const verifyToken = require('../middleware/verifyToken')
const validateObjectId = require('../middleware/validateObjectId')
const {verifyHrAdmin} = require('../middleware/verifyRole')
const {createLeaveAllocation, getAllLeaveAllocations, getAllocationById, updateAllocation, deleteAllocation} = require('../controllers/leaveallocation.controller')

router.post("/", verifyToken,verifyHrAdmin, createLeaveAllocation)

router.get("/", verifyToken, getAllLeaveAllocations)

router.get("/:id", verifyToken, validateObjectId, getAllocationById)

router.put("/:id", verifyToken, verifyHrAdmin, validateObjectId, updateAllocation) 

router.delete("/:id", verifyToken, verifyHrAdmin, validateObjectId, deleteAllocation)

module.exports = router
