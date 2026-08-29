const router = require("express").Router()
const verifyToken = require('../middleware/verifyToken')
const verifyRole = require('../middleware/verifyRole')
const {
 createEmployee ,getMyProfile ,updateMyContact ,getAllEmployees,getEmployeeById,updateEmployeeByHrAdmin,updateEmployeeStatus,getAllEmployeeDepartment,getTeamEmployees
} = require('../controllers/employee.controller')

// ================= HR ADMIN =================

// Create employee + user
router.post(
  "/",
  verifyToken,
  verifyRole.verifyHrAdmin,
  createEmployee
);

// Get all employees
router.get(
  "/",
  verifyToken,
  verifyRole.verifyHrAdmin,
  getAllEmployees
);

// Update employee + user data
router.put(
  "/:userId",
  verifyToken,
  verifyRole.verifyHrAdmin,
  updateEmployeeByHrAdmin
);

// Update only employee status
router.patch(
  "/:userId/status",
  verifyToken,
  verifyRole.verifyHrAdmin,
  updateEmployeeStatus
);


// ================= EMPLOYEE =================

// Get logged-in employee profile
router.get(
  "/me/profile",
  verifyToken,
  getMyProfile
);

// Update logged-in employee contact details
router.patch(
  "/me/contact",
  verifyToken,
  updateMyContact
);


// ================= MANAGER =================

// Get employees reporting to logged-in manager
router.get(
  "/team",
  verifyToken,
  verifyRole.verifyManager,
  getTeamEmployees
);

// Get employees in manager's department
router.get(
  "/department",
  verifyToken,
  verifyRole.verifyManager,
  getAllEmployeeDepartment
);


// ================= SHARED / HR =================

// Get one employee using userId
router.get(
  "/:userId",
  verifyToken,
  verifyRole.verifyHrAdmin,
  getEmployeeById
);


module.exports = router
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