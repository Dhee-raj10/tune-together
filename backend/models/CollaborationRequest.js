const mongoose = require('mongoose');

const collaborationRequestSchema = new mongoose.Schema({
  senderId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  receiverId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  projectName: {
    type: String,
    required: true
  },
  projectDescription: String,
  lookingForInstrument: String,
  message: String,
  status: {
    type: String,
    enum: ['pending', 'accepted', 'rejected', 'cancelled'],
    default: 'pending'
  },
  expiresAt: {
    type: Date,
    default: () => Date.now() + 7 * 24 * 60 * 60 * 1000 // 7 days
  }
}, {
  timestamps: true
});

// Index for faster queries
collaborationRequestSchema.index({ receiverId: 1, status: 1 });
collaborationRequestSchema.index({ senderId: 1 });

module.exports = mongoose.model('CollaborationRequest', collaborationRequestSchema);