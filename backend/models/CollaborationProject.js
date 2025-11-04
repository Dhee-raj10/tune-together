const mongoose = require('mongoose');

const trackSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  instrument: String,
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  audioFileUrl: String,
  notes: {
    type: mongoose.Schema.Types.Mixed,
    default: []
  },
  effects: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  },
  volume: {
    type: Number,
    default: 1.0,
    min: 0,
    max: 2
  },
  pan: {
    type: Number,
    default: 0,
    min: -1,
    max: 1
  },
  isMuted: {
    type: Boolean,
    default: false
  },
  isSolo: {
    type: Boolean,
    default: false
  },
  trackOrder: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

const collaboratorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  role: {
    type: String,
    default: 'collaborator'
  },
  permissions: {
    type: String,
    enum: ['view', 'edit', 'admin'],
    default: 'edit'
  },
  joinedAt: {
    type: Date,
    default: Date.now
  },
  lastActive: {
    type: Date,
    default: Date.now
  }
});

const collaborationProjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  description: String,
  requestId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'CollaborationRequest'
  },
  sessionId: {
    type: String,
    required: true,
    unique: true
  },
  collaborators: [collaboratorSchema],
  tracks: [trackSchema],
  bpm: {
    type: Number,
    default: 120,
    min: 40,
    max: 240
  },
  timeSignature: {
    type: String,
    default: '4/4'
  },
  keySignature: String,
  status: {
    type: String,
    enum: ['active', 'completed', 'archived'],
    default: 'active'
  }
}, {
  timestamps: true
});

// Indexes
collaborationProjectSchema.index({ 'collaborators.userId': 1 });
collaborationProjectSchema.index({ sessionId: 1 });

module.exports = mongoose.model('CollaborationProject', collaborationProjectSchema);