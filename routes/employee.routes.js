const express = require('express')
const router = express.Router()
const verifyToken = require('../middleware/verifyToken')
const { verifyHrAdmin } = require('../middleware/verifyRole')
const {
  createUser,
  getAllUsers,
  getUserById,
  updateUser,
  deleteUser,
} = require('../controllers/user.controller')

router.post('/', verifyToken, verifyHrAdmin, createUser)
router.get('/', verifyToken, getAllUsers)
router.get('/:userId', verifyToken, getUserById)
router.put('/:userId', verifyToken, updateUser)
router.delete('/:userId', verifyToken, deleteUser)

module.exports = router