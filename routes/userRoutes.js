const express = require('express')
const router = express.Router()
const { registerUser, getUser, updateUser, getAllUsers } = require('../controllers/userController')
const { protect, authorise } = require('../middlewares/auth')

router.post('/register', registerUser)
router.get('/', protect, authorise('admin'), getAllUsers)
router.get('/:id', protect, getUser)
router.put('/:id', protect, updateUser)

module.exports = router
