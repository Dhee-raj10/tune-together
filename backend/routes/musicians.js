// backend/routes/musicians.js
const express = require('express');
const router = express.Router();
const UserInstrument = require('../models/UserInstrument');
const CollaborationProject = require('../models/CollaborationProject');
const { authenticate } = require('../middleware/collaborationAuth');

// Search musicians by instrument
router.get('/search', authenticate, async (req, res) => {
  try {
    const { instrument, skillLevel, limit = 20, page = 1 } = req.query;
    const currentUserId = req.user._id || req.user.id;

    const query = { userId: { $ne: currentUserId } };
    
    if (instrument) query.instrument = instrument;
    if (skillLevel) query.skillLevel = skillLevel;

    const userInstruments = await UserInstrument.find(query)
      .populate('userId', 'username profilePicture bio')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ yearsExperience: -1 });

    const validInstruments = userInstruments.filter(ui => ui.userId);

    const musiciansWithCounts = await Promise.all(
      validInstruments.map(async (ui) => {
        const projectCount = await CollaborationProject.countDocuments({
          'collaborators.userId': ui.userId._id
        });

        return {
          id: ui.userId._id,
          username: ui.userId.username,
          profilePicture: ui.userId.profilePicture,
          bio: ui.userId.bio,
          instrument: ui.instrument,
          skillLevel: ui.skillLevel,
          yearsExperience: ui.yearsExperience,
          projectCount
        };
      })
    );

    res.json({ musicians: musiciansWithCounts });
  } catch (error) {
    console.error('Search musicians error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get available instruments
router.get('/instruments', async (req, res) => {
  try {
    const instruments = await UserInstrument.aggregate([
      { $group: { _id: '$instrument', userCount: { $sum: 1 } } },
      { $project: { instrument: '$_id', userCount: 1, _id: 0 } },
      { $sort: { userCount: -1 } }
    ]);

    res.json({ instruments });
  } catch (error) {
    console.error('Get instruments error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add instrument to user profile
router.post('/my-instruments', authenticate, async (req, res) => {
  try {
    const { instrument, skillLevel, yearsExperience, isPrimary } = req.body;
    const userId = req.user._id || req.user.id;

    if (!instrument) {
      return res.status(400).json({ error: 'Instrument is required' });
    }

    if (isPrimary) {
      await UserInstrument.updateMany({ userId }, { $set: { isPrimary: false } });
    }

    const userInstrument = new UserInstrument({
      userId,
      instrument,
      skillLevel: skillLevel || 'Intermediate',
      yearsExperience: yearsExperience || 0,
      isPrimary: isPrimary || false
    });

    await userInstrument.save();
    res.status(201).json({ instrument: userInstrument });
  } catch (error) {
    console.error('Add instrument error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get user's instruments
router.get('/my-instruments', authenticate, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const instruments = await UserInstrument.find({ userId });
    res.json({ instruments });
  } catch (error) {
    console.error('Get my instruments error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;