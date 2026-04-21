const User = require('../models/User')

// POST /api/users/register  (alias kept for backward compat)
const registerUser = async (req, res, next) => {
  try {
    const { name, phone, role, address } = req.body

    const exists = await User.findOne({ phone })
    if (exists) return res.status(400).json({ message: 'Phone already registered' })

    const user = await User.create({ name, phone, role, address })
    res.status(201).json(user)
  } catch (error) {
    next(error)
  }
}

// GET /api/users/:id
const getUser = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id).select('-otp')
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json(user)
  } catch (error) {
    next(error)
  }
}

// PUT /api/users/:id
const updateUser = async (req, res, next) => {
  try {
    const { name, address, creditLimit } = req.body
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { name, address, creditLimit },
      { new: true, runValidators: true }
    ).select('-otp')
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json(user)
  } catch (error) {
    next(error)
  }
}

// GET /api/users  (admin only)
const getAllUsers = async (req, res, next) => {
  try {
    const { role } = req.query
    const filter = role ? { role } : {}
    const users = await User.find(filter).select('-otp').sort({ createdAt: -1 })
    res.json(users)
  } catch (error) {
    next(error)
  }
}

module.exports = { registerUser, getUser, updateUser, getAllUsers }
