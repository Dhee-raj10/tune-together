const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth');

// @route PUT /api/profiles/:id/roles
router.put('/:id/roles', auth, async (req, res) => {
  const { roles } = req.body;
  
  // Fixed: Proper ID comparison
  const requestUserId = (req.user.id || req.user._id).toString();
  const targetUserId = req.params.id.toString();
  
  console.log('🔐 Role update request:');
  console.log('   Request user ID:', requestUserId);
  console.log('   Target user ID:', targetUserId);
  console.log('   New roles:', roles);
  
  if (requestUserId !== targetUserId) {
      console.log('❌ Authorization denied - ID mismatch');
      return res.status(403).json({ msg: 'Authorization denied. Cannot update another user\'s roles.' });
  }

  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { roles: roles } },
      { new: true, runValidators: true } 
    ).select('-password'); 

    if (!user) {
      console.log('❌ User not found');
      return res.status(404).json({ msg: 'User profile not found.' });
    }

    console.log('✅ Roles updated successfully');
    console.log('   User:', user.username);
    console.log('   Roles:', user.roles);
    
    res.json(user);
  } catch (err) {
    console.error('❌ Error updating roles:', err.message);
    res.status(500).send('Server error');
  }
});

// @route GET /api/profiles/me
router.get('/me', auth, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;
    console.log('📖 GET /profiles/me for user:', userId);
    
    const user = await User.findById(userId).select('-password');
    
    if (!user) {
      console.log('❌ Profile not found');
      return res.status(404).json({ msg: 'Profile not found' });
    }
    
    console.log('✅ Profile retrieved:', user.username);
    res.json(user);
  } catch (err) {
    console.error('❌ Error:', err.message);
    res.status(500).send('Server error');
  }
});

// @route GET /api/profiles/:id
router.get('/:id', async (req, res) => {
  try {
    console.log('📖 GET /profiles/:id for:', req.params.id);
    
    const user = await User.findById(req.params.id).select('-password');
    
    if (!user) {
      console.log('❌ Profile not found');
      return res.status(404).json({ msg: 'Profile not found' });
    }
    
    console.log('✅ Profile retrieved:', user.username);
    res.json(user);
  } catch (err) {
    console.error('❌ Error:', err.message);
    res.status(500).send('Server error');
  }
});

// @route GET /api/profiles
router.get('/', async (req, res) => {
  try {
    const { roles } = req.query;
    console.log('📖 GET /profiles with filters:', { roles });
    
    let users;

    if (roles) {
      const roleArray = roles.split(',').map(r => r.trim());
      users = await User.find({ roles: { $in: roleArray } }).select('-password');
    } else {
      users = await User.find().select('-password');
    }
    
    console.log(`✅ Retrieved ${users.length} profiles`);
    res.json(users);
  } catch (err) {
    console.error('❌ Error:', err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;