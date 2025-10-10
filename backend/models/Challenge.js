const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Supports Gamified challenges with submissions (Module 4)
const ChallengeSchema = new Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  genre: { type: String },
  due_date: { type: Date },
  prizes: { type: String },
  submissions: [{ type: Schema.Types.ObjectId, ref: 'Project' }], 
  is_active: { type: Boolean, default: true }
});

module.exports = mongoose.model('Challenge', ChallengeSchema);
