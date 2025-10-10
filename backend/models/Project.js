const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const ProjectSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  mode: { type: String, enum: ['solo', 'collaboration', 'learning'], default: 'solo' },
  owner_id: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  tempo: { type: Number, default: 120 },
  master_volume: { type: Number, default: 0.8 },
  collaborators: [{ type: Schema.Types.ObjectId, ref: 'User' }]
});

module.exports = mongoose.model('Project', ProjectSchema);