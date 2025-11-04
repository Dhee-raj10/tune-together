const mongoose = require('mongoose');

const userInstrumentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  instrument: {
    type: String,
    required: true
  },
  skillLevel: {
    type: String,
    enum: ['Beginner', 'Intermediate', 'Advanced', 'Professional'],
    default: 'Intermediate'
  },
  yearsExperience: {
    type: Number,
    min: 0,
    max: 100
  },
  isPrimary: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index
userInstrumentSchema.index({ userId: 1 });
userInstrumentSchema.index({ instrument: 1 });

module.exports = mongoose.model('UserInstrument', userInstrumentSchema);