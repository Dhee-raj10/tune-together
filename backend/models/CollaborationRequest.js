const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Supports Collaboration Requests (Module 2)
const CollaborationRequestSchema = new Schema({
  project_id: { type: Schema.Types.ObjectId, ref: 'Project', required: true },
  from_user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  to_user_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  message: { type: String, maxlength: 500 },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
  created_at: { type: Date, default: Date.now }
});

module.exports = mongoose.model('CollaborationRequest', CollaborationRequestSchema);
