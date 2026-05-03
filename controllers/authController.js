const jwt = require('jsonwebtoken')
const User = require('../models/User')
const twilio = require('twilio')

const twilioClient = twilio(process.env.TWILIO_ACCOUNT_SID, process.env.TWILIO_AUTH_TOKEN)

const generateToken = (id) =>
  jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' })

const generateOTP = () => Math.floor(100000 + Math.random() * 900000).toString()

const sendOTPviaTwilio = async (phone, otp) => {
  await twilioClient.messages.create({
    body: `Your BuildMart OTP is ${otp}. Valid for 5 minutes. Do not share with anyone.`,
    from: process.env.TWILIO_PHONE,
    to: `+91${phone}`
  })
}

// POST /api/auth/send-otp
const sendOTP = async (req, res, next) => {
  try {
    const { phone } = req.body
    if (!phone) return res.status(400).json({ message: 'Phone number is required' })
    const otp = generateOTP()
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000)
    await User.findOneAndUpdate(
      { phone },
      { otp: { code: otp, expiresAt } },
      { upsert: false }
    )
    await sendOTPviaTwilio(phone, otp)
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
    await sendOTPviaTwilio(phone, otp)
    res.status(201).json({
      message: 'Account created. Verify your phone with the OTP.',
      userId: user._id,
    })
  } catch (error) {
    next(error)
  }
}

module.exports = { sendOTP, verifyOTP, signup }
