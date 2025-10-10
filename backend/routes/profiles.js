// routes/profiles.js
const express = require('express');
const router = express.Router();
const User = require('../models/User');
const auth = require('../middleware/auth'); // Correct path

// @route PUT /api/profiles/:id/roles
router.put('/:id/roles', auth, async (req, res) => {
  const { roles } = req.body;
  
  if (req.user.id !== req.params.id) {
      return res.status(403).json({ msg: 'Authorization denied. Cannot update another user\'s roles.' });
  }

  try {
    const user = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { roles: roles } },
      { new: true, runValidators: true } 
    ).select('-password'); 

    if (!user) return res.status(404).json({ msg: 'User profile not found.' });

    res.json(user); // Returns the updated user object
  } catch (err) {
    console.error('Error updating roles:', err.message);
    res.status(500).send('Server error');
  }
});

// @route GET /api/profiles/me
router.get('/me', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) return res.status(404).json({ msg: 'Profile not found' });
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route GET /api/profiles/:id
router.get('/:id', async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ msg: 'Profile not found' });
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route GET /api/profiles
router.get('/', async (req, res) => {
  try {
    const { roles } = req.query;
    let users;

    if (roles) {
      const roleArray = roles.split(',').map(r => r.trim());
      users = await User.find({ roles: { $in: roleArray } }).select('-password');
    } else {
      users = await User.find().select('-password');
    }
    
    res.json(users);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

module.exports = router;