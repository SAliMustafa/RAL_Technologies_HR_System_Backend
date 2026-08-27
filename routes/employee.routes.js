const express = require('express')
const router = express.Router()
const verifyToken = require('../middleware/verifyToken')
const { verifyHrAdmin } = require('../middleware/verifyRole')
const {
    createEmployee,
    getAllEmployees,
    getEmployeeById,
    updateEmployee,
    linkUserAccount
} = require('../controllers/employee.controller')

router.post('/', verifyToken, verifyHrAdmin, createEmployee)
router.get('/', verifyToken, getAllEmployees)
router.get('/:employeeId', verifyToken, getEmployeeById)
router.put('/:employeeId', verifyToken, updateEmployee)
router.patch('/:employeeId/link-user', verifyToken, linkUserAccount)

module.exports = router