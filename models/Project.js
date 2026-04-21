const mongoose = require('mongoose')

const projectSchema = new mongoose.Schema(
  {
    contractorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Contractor ID is required'],
    },
    name: {
      type: String,
      required: [true, 'Project name is required'],
      trim: true,
    },
    location: {
      type: String,
      trim: true,
    },
    status: {
      type: String,
      enum: ['active', 'completed', 'on_hold'],
      default: 'active',
    },
  },
  { timestamps: true }
)

projectSchema.index({ contractorId: 1 })

module.exports = mongoose.model('Project', projectSchema)
