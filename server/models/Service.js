const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  providerId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Service title is required'],
    trim: true,
    maxLength: 100
  },
  description: {
    type: String,
    required: [true, 'Service description is required'],
    maxLength: 500
  },
  category: {
    type: String,
    required: true,
    enum: ['cleaning', 'plumbing', 'electrical', 'gardening', 'painting', 'carpentry', 'tutoring', 'other']
  },
  rate: {
    type: Number,
    required: [true, 'Hourly rate is required'],
    min: 0
  },
  duration: {
    type: Number, // in minutes
    required: true,
    default: 60
  },
  isActive: {
    type: Boolean,
    default: true
  },
  tags: [String],
  images: [String],
  requirements: [String]
}, {
  timestamps: true
});

// Index for text search
serviceSchema.index({
  title: 'text',
  description: 'text',
  category: 'text',
  tags: 'text'
});

module.exports = mongoose.model('Service', serviceSchema);