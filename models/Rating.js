const mongoose = require('mongoose')

const ratingSchema = new mongoose.Schema(
  {
    contractorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Contractor ID is required'],
    },
    dealerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Dealer ID is required'],
    },
    orderId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    review: {
      type: String,
      trim: true,
      maxlength: [500, 'Review cannot exceed 500 characters'],
    },
  },
  { timestamps: true }
)

// One rating per contractor-dealer-order combination
ratingSchema.index({ contractorId: 1, dealerId: 1, orderId: 1 }, { unique: true })

module.exports = mongoose.model('Rating', ratingSchema)
