const mongoose = require('mongoose')

const creditLedgerSchema = new mongoose.Schema(
  {
    contractorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Contractor ID is required'],
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: [true, 'Order ID is required'],
    },
    amount: {
      type: Number,
      required: [true, 'Amount is required'],
      min: [0, 'Amount cannot be negative'],
    },
    status: {
      type: String,
      enum: ['pending', 'paid'],
      default: 'pending',
    },
    dueDate: {
      type: Date,
      required: [true, 'Due date is required'],
    },
    paidAt: {
      type: Date,
    },
  },
  { timestamps: true }
)

// Fast lookup by contractor, and filtering by status
creditLedgerSchema.index({ contractorId: 1 })
creditLedgerSchema.index({ contractorId: 1, status: 1 })

module.exports = mongoose.model('CreditLedger', creditLedgerSchema)
