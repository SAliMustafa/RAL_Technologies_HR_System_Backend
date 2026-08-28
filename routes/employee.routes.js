const router = require("express").Router()
const verifyToken = require('../middleware/verifyToken')
const verifyRole = require('../middleware/verifyRole')
const {
 createEmployee
} = require('../controllers/employee.controller')

router.post('/', verifyToken, verifyRole.verifyHrAdmin, createEmployee )

// router.get('/', verifyToken, getAllUsers)
// router.get('/:userId', verifyToken, getUserById)
// router.put('/:userId', verifyToken, updateUser)
// router.delete('/:userId', verifyToken, deleteUser)

module.exports = router