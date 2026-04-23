const CreditLedger = require('../models/CreditLedger')
const User = require('../models/User')
const mongoose = require('mongoose')

// GET /api/credit/:contractorId
const getCreditLedger = async (req, res, next) => {
  try {
    const { status } = req.query

    if (!mongoose.Types.ObjectId.isValid(req.params.contractorId)) {
      return res.json({ entries: [], pendingTotal: 0 })
    }

    const filter = { contractorId: req.params.contractorId }
    if (status) filter.status = status

    const entries = await CreditLedger.find(filter)
      .populate('orderId', 'totalAmount createdAt deliveryAddress')
      .sort({ createdAt: -1 })

    // Summary
    const pending = entries
      .filter((e) => e.status === 'pending')
      .reduce((sum, e) => sum + e.amount, 0)

    res.json({ entries, pendingTotal: pending })
  } catch (error) {
    next(error)
  }
}

// PUT /api/credit/:id/pay  — mark a ledger entry as paid
const markAsPaid = async (req, res, next) => {
  try {
    const entry = await CreditLedger.findByIdAndUpdate(
      req.params.id,
      { status: 'paid', paidAt: new Date() },
      { new: true }
    )
    if (!entry) return res.status(404).json({ message: 'Credit entry not found' })
    res.json(entry)
  } catch (error) {
    next(error)
  }
}

// PUT /api/credit/limit/:userId  — admin updates credit limit
const updateCreditLimit = async (req, res, next) => {
  try {
    const { creditLimit } = req.body
    const user = await User.findByIdAndUpdate(
      req.params.userId,
      { creditLimit },
      { new: true, runValidators: true }
    ).select('-otp')
    if (!user) return res.status(404).json({ message: 'User not found' })
    res.json(user)
  } catch (error) {
    next(error)
  }
}

module.exports = { getCreditLedger, markAsPaid, updateCreditLimit }
