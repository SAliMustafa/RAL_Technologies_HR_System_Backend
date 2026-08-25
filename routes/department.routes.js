const router = require("express").Router()
const verifyToken = require('../middleware/verifyToken')
const validateObjectId = require('../middleware/validateObjectId')
const {verifyHrAdmin} = require('../middleware/verifyRole')
const departmentController = require('../controllers/department.controller')

router.post("/", verifyToken, verifyHrAdmin, departmentController.createDepartment)

router.get("/", verifyToken, departmentController.getDepartment)

router.get("/:id", verifyToken, validateObjectId, departmentController.getDepartmentById)

router.put("/:id", verifyToken, verifyHrAdmin, validateObjectId, departmentController.updateDepartment)

module.exports = router
