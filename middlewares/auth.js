const jwt = require('jsonwebtoken')
const User = require('../models/User')

const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Not authorised — no token provided' })
  }

  const token = authHeader.split(' ')[1]

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = await User.findById(decoded.id).select('-otp')
    if (!req.user) {
      return res.status(401).json({ message: 'User not found' })
    }
    next()
  } catch {
    return res.status(401).json({ message: 'Not authorised — invalid token' })
  }
}

// Role-based access guard
const authorise = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied — requires role: ${roles.join(' or ')}`,
      })
    }
    next()
  }
}

module.exports = { protect, authorise }
