const mongoose = require('mongoose')

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
    },
    phone: {
      type: String,
      required: [true, 'Phone number is required'],
      unique: true,
      trim: true,
      match: [/^[6-9]\d{9}$/, 'Enter a valid 10-digit Indian mobile number'],
    },
    role: {
      type: String,
      enum: ['contractor', 'dealer', 'admin'],
      required: [true, 'Role is required'],
    },
    address: {
      type: String,
      trim: true,
    },
    creditLimit: {
      type: Number,
      default: 0,
      min: 0,
    },
    // Used for OTP-based auth
    otp: {
      code: String,
      expiresAt: Date,
    },
  },
  { timestamps: true }
)

module.exports = mongoose.model('User', userSchema)
