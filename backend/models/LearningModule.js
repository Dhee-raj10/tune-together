const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Supports Interactive Learning Modules (Module 4)
const LearningModuleSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String },
  difficulty: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], default: 'Beginner' },
  category: { type: String },
  content_url: { type: String }, // Link to tutorials/videos
  challenge_id: { type: Schema.Types.ObjectId, ref: 'Challenge' } 
});

module.exports = mongoose.model('LearningModule', LearningModuleSchema);
