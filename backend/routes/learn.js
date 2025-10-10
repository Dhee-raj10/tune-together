const express = require('express');
const router = express.Router();
const LearningModule = require('../models/LearningModule');
const Challenge = require('../models/Challenge'); 

// MOCK DATA for initialization
const MOCK_MODULES = [
    { title: "Intro to Music Theory", description: "Scales, chords, and rhythm fundamentals.", difficulty: 'Beginner', category: 'Theory', content_url: 'https://youtube.com/playlist?list=PLi' },
    { title: "Advanced Mixing", description: "Deep dive into EQ, compression, and mastering.", difficulty: 'Advanced', category: 'Mixing', content_url: 'https://youtube.com/playlist?list=PLj' },
];
const MOCK_CHALLENGES = [
    { title: "Lofi Beat Challenge", description: "Create a relaxing lo-fi beat track in under 3 hours.", genre: 'Lofi', is_active: true, prizes: 'Top submission gets featured.' },
];

// Initialize mock data (run once)
const initializeLearningData = async () => {
    try {
        await LearningModule.deleteMany({});
        await LearningModule.insertMany(MOCK_MODULES);
        await Challenge.deleteMany({});
        await Challenge.insertMany(MOCK_CHALLENGES);
        console.log('Learning modules and challenges initialized.');
    } catch (e) {
        console.error('Error initializing learning data:', e.message);
    }
};
// Uncomment the line below to run initialization when server starts
// initializeLearningData();


// @route GET /api/learn/modules (Module 4)
router.get('/modules', async (req, res) => {
  try {
    const modules = await LearningModule.find();
    res.json(modules);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route GET /api/learn/challenges (Module 4)
router.get('/challenges', async (req, res) => {
  try {
    const challenges = await Challenge.find({ is_active: true }).sort({ due_date: 1 });
    res.json(challenges);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route GET /api/learn/modules/:id
router.get('/modules/:id', async (req, res) => {
  try {
    const module = await LearningModule.findById(req.params.id);
    if (!module) return res.status(404).json({ msg: 'Learning module not found' });
    res.json(module);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;
