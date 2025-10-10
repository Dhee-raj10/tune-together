const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Stores current active users and simple history for collaboration
const ProjectStateSchema = new Schema({
  project_id: { type: Schema.Types.ObjectId, ref: 'Project', required: true, unique: true },
  active_collaborators: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  last_updates: [{
    user_id: { type: Schema.Types.ObjectId, ref: 'User' },
    timestamp: { type: Date, default: Date.now },
    change_type: { type: String, enum: ['TEMPO', 'VOLUME', 'TRACK_MOVE', 'TRACK_ADD', 'TRACK_DELETE'] }
  }],
});

module.exports = mongoose.model('ProjectState', ProjectStateSchema);
