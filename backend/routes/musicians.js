const express = require('express');
const router = express.Router();
const UserInstrument = require('../models/UserInstrument');
const CollaborationProject = require('../models/CollaborationProject');
const auth = require('../middleware/auth');

function cleanInstrumentName(instrument) {
  if (!instrument) return '';
  
  // Remove emojis and extra spaces
  const cleaned = instrument
    .replace(/[\u{1F300}-\u{1F9FF}]/gu, '') // Remove emojis
    .replace(/[\u{2600}-\u{26FF}]/gu, '')   // Remove misc symbols
    .trim();
  
  console.log(`🧹 Cleaned instrument: "${instrument}" -> "${cleaned}"`);
  return cleaned;
}

// Search musicians by instrument
router.get('/search', auth, async (req, res) => {
  try {
    const { instrument, skillLevel, limit = 20, page = 1 } = req.query;
    const currentUserId = (req.user.id || req.user._id).toString();

    console.log('🔍 Search musicians:');
    console.log('   Instrument:', instrument);
    console.log('   Skill Level:', skillLevel);
    console.log('   Current User:', currentUserId);

    // Build query with case-insensitive search
    const query = { 
      userId: { $ne: currentUserId } 
    };
    
    if (instrument) {
      query.instrument = { $regex: new RegExp(`^${instrument}$`, 'i') };
    }
    if (skillLevel) {
      query.skillLevel = skillLevel;
    }

    console.log('   Query:', JSON.stringify(query));

    const userInstruments = await UserInstrument.find(query)
      .populate('userId', 'username avatar_url email')
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .sort({ yearsExperience: -1 });

    console.log(`✅ Found ${userInstruments.length} instruments`);
    
    userInstruments.forEach((ui, i) => {
      console.log(`   ${i + 1}. ${ui.userId?.username || 'NULL'} - ${ui.instrument} (${ui.skillLevel})`);
    });

    const validInstruments = userInstruments.filter(ui => ui.userId);
    console.log(`✅ Valid: ${validInstruments.length}`);

    const musiciansWithCounts = await Promise.all(
      validInstruments.map(async (ui) => {
        const projectCount = await CollaborationProject.countDocuments({
          'collaborators.userId': ui.userId._id
        });

        return {
          id: ui.userId._id,
          username: ui.userId.username,
          profilePicture: ui.userId.avatar_url,
          bio: '',
          instrument: ui.instrument,
          skillLevel: ui.skillLevel,
          yearsExperience: ui.yearsExperience,
          projectCount
        };
      })
    );

    console.log(`🎵 Returning ${musiciansWithCounts.length} musicians`);

    res.json({ musicians: musiciansWithCounts });
  } catch (error) {
    console.error('❌ Search error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get available instruments
router.get('/instruments', async (req, res) => {
  try {
    console.log('📊 GET /instruments');
    
    const instruments = await UserInstrument.aggregate([
      { $group: { _id: '$instrument', userCount: { $sum: 1 } } },
      { $project: { instrument: '$_id', userCount: 1, _id: 0 } },
      { $sort: { userCount: -1 } }
    ]);

    console.log(`✅ Found ${instruments.length} unique instruments`);

    res.json({ instruments });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Add instrument to user profile
router.post('/my-instruments', auth, async (req, res) => {
  try {
    const { instrument, skillLevel, yearsExperience, isPrimary } = req.body;
    const userId = req.user.id || req.user._id;

    console.log('➕ Adding instrument:');
    console.log('   User ID:', userId);
    console.log('   Instrument:', instrument);
    console.log('   Skill:', skillLevel);
    console.log('   Years:', yearsExperience);
    console.log('   Primary:', isPrimary);

    if (!instrument) {
      console.log('❌ No instrument provided');
      return res.status(400).json({ error: 'Instrument is required' });
    }

    // Check if instrument already exists for this user
    const existing = await UserInstrument.findOne({ userId, instrument });
    if (existing) {
      console.log('⚠️ Instrument already exists, updating instead');
      existing.skillLevel = skillLevel || existing.skillLevel;
      existing.yearsExperience = yearsExperience || existing.yearsExperience;
      existing.isPrimary = isPrimary || existing.isPrimary;
      await existing.save();
      console.log('✅ Updated existing instrument');
      return res.status(200).json({ instrument: existing });
    }

    // If setting as primary, unset other primary instruments
    if (isPrimary) {
      console.log('🔄 Unsetting other primary instruments');
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
    
    console.log('✅ Instrument saved:', userInstrument._id);
    
    res.status(201).json({ instrument: userInstrument });
  } catch (error) {
    console.error('❌ Add instrument error:', error);
    console.error('   Stack:', error.stack);
    res.status(500).json({ error: error.message });
  }
});

// Get user's instruments
router.get('/my-instruments', auth, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    
    console.log('📖 GET /my-instruments for user:', userId);
    
    const instruments = await UserInstrument.find({ userId });
    
    console.log(`✅ Found ${instruments.length} instruments for this user`);
    
    res.json({ instruments });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update user's instrument
router.put('/my-instruments/:id', auth, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { id } = req.params;
    const { instrument, skillLevel, yearsExperience, isPrimary } = req.body;

    console.log('✏️ Updating instrument:', id);

    if (isPrimary) {
      await UserInstrument.updateMany(
        { userId, _id: { $ne: id } }, 
        { $set: { isPrimary: false } }
      );
    }

    const result = await UserInstrument.findOneAndUpdate(
      { _id: id, userId: userId },
      { instrument, skillLevel, yearsExperience, isPrimary },
      { new: true }
    );

    if (!result) {
      console.log('❌ Instrument not found');
      return res.status(404).json({ error: 'Instrument not found' });
    }

    console.log('✅ Instrument updated');
    res.json({ instrument: result });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete user's instrument
router.delete('/my-instruments/:id', auth, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    const { id } = req.params;

    console.log('🗑️ Deleting instrument:', id);

    const result = await UserInstrument.findOneAndDelete({
      _id: id,
      userId: userId
    });

    if (!result) {
      console.log('❌ Instrument not found');
      return res.status(404).json({ error: 'Instrument not found' });
    }

    console.log('✅ Instrument deleted');
    res.json({ message: 'Instrument deleted successfully' });
  } catch (error) {
    console.error('❌ Error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;