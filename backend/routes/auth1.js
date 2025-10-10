const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const config = require('../config/default');

// @route POST /api/auth/signup
router.post('/signup', async (req, res) => {
  // FIX: Ensure we destructure 'username' from the request body
  const { username, email, password } = req.body; 
  try {
    const normalizedEmail = email.toLowerCase();
    
    // Check if user exists by normalized email
    let user = await User.findOne({ email: normalizedEmail }); 
    if (user) return res.status(400).json({ msg: 'User already exists' });
    
    // Check if username already exists (based on User model unique constraint)
    let userByUsername = await User.findOne({ username }); 
    if (userByUsername) return res.status(400).json({ msg: 'Username is already taken' });
    
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    
    // Save both username and email
    user = new User({ username, email: normalizedEmail, password: hashedPassword });
    await user.save();
    
    const payload = { user: { id: user.id } };
    const token = jwt.sign(payload, config.jwtSecret, { expiresIn: '1h' });

    const userObject = user.toObject(); 
    delete userObject.password; 

    res.json({ token, user: userObject });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route POST /api/auth/login
router.post('/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const normalizedEmail = email.toLowerCase();

        let user = await User.findOne({ email: normalizedEmail });
        if (!user) {
            return res.status(400).json({ msg: 'Invalid Credentials' }); 
        }
        // ... (omitted remaining login logic which is correct)
        
        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ msg: 'Invalid Credentials' });
        }

        const payload = { user: { id: user.id } };
        const token = jwt.sign(payload, config.jwtSecret, { expiresIn: '1h' });

        const userObject = user.toObject(); 
        delete userObject.password; 

        res.json({ 
            token, 
            user: userObject
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;
