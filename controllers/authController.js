const jwt = require('jsonwebtoken')
const User = require('../models/User')

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' })

// Simulate OTP (replace with actual SMS provider in production)
const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString()

// POST /api/auth/send-otp
const sendOTP = async (req, res, next) => {
  try {
    const { phone } = req.body
    if (!phone) return res.status(400).json({ message: 'Phone number is required' })

    const otp = generateOTP()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000) // 5 minutes

    await User.findOneAndUpdate(
      { phone },
      { otp: { code: otp, expiresAt } },
      { upsert: false }
    )

    // TODO: Integrate SMS provider (Twilio, MSG91, etc.) to send `otp` to `phone`
    console.log(`OTP for ${phone}: ${otp}`) // Remove in production

    res.json({ message: 'OTP sent successfully' })
  } catch (error) {
    next(error)
  }
}

// POST /api/auth/verify-otp
const verifyOTP = async (req, res, next) => {
  try {
    const { phone, otp } = req.body
    if (!phone || !otp) return res.status(400).json({ message: 'Phone and OTP are required' })

    const user = await User.findOne({ phone })
    if (!user) return res.status(404).json({ message: 'User not found. Please sign up first.' })

    if (!user.otp || user.otp.code !== otp) {
      return res.status(400).json({ message: 'Invalid OTP' })
    }
    if (user.otp.expiresAt < new Date()) {
      return res.status(400).json({ message: 'OTP has expired' })
    }

    // Clear OTP after use
    user.otp = undefined
    await user.save()

    res.json({
      _id: user._id,
      name: user.name,
      phone: user.phone,
      role: user.role,
      token: generateToken(user._id),
    })
  } catch (error) {
    next(error)
  }
}

// POST /api/auth/signup
const signup = async (req, res, next) => {
  try {
    const { name, phone, role, address } = req.body

    const exists = await User.findOne({ phone })
    if (exists) return res.status(400).json({ message: 'Phone number already registered' })

    const otp = generateOTP()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000)

    const user = await User.create({
      name,
      phone,
      role,
      address,
      otp: { code: otp, expiresAt },
    })

    // TODO: Send OTP via SMS
    console.log(`OTP for new user ${phone}: ${otp}`) // Remove in production

    res.status(201).json({
      message: 'Account created. Verify your phone with the OTP.',
      userId: user._id,
    })
  } catch (error) {
    next(error)
  }
}

module.exports = { sendOTP, verifyOTP, signup }
