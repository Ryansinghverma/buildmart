const mongoose = require('mongoose')

const productSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      trim: true,
      enum: ['Cement', 'Steel', 'Aggregates', 'Bricks', 'Timber', 'Other'],
    },
    unit: {
      type: String,
      required: [true, 'Unit is required'],
      trim: true,
    },
    description: {
      type: String,
      trim: true,
    },
    image: {
      type: String, // emoji or URL
      default: '📦',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
)

// Index for fast category filtering
productSchema.index({ category: 1 })

module.exports = mongoose.model('Product', productSchema)
