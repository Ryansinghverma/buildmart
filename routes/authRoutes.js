const express = require('express')
const router = express.Router()
const { sendOTP, verifyOTP, signup } = require('../controllers/authController')

router.post('/send-otp', sendOTP)
router.post('/verify-otp', verifyOTP)
router.post('/signup', signup)

module.exports = router
