const mongoose = require('mongoose');
const User = require('../models/User');
const UserInstrument = require('../models/UserInstrument');
const bcrypt = require('bcryptjs');

mongoose.connect('mongodb://localhost:27017/tune_together')
  .then(() => console.log('✅ Connected'))
  .catch(err => console.error('❌ Error:', err));

async function addTestData() {
  try {
    console.log('\n🎵 Adding test musicians...\n');
    
    // User 1: Guitarist
    let user1 = await User.findOne({ email: 'test_guitar@test.com' });
    if (!user1) {
      user1 = new User({
        username: 'test_guitarist',
        email: 'test_guitar@test.com',
        password: await bcrypt.hash('password123', 10),
        roles: ['guitarist']
      });
      await user1.save();
      console.log('✅ Created guitarist user');
    } else {
      console.log('ℹ️ Guitarist user already exists');
    }
    
    // Add Guitar instrument for user 1
    const guitar = await UserInstrument.findOne({ userId: user1._id, instrument: 'Guitar' });
    if (!guitar) {
      const newGuitar = new UserInstrument({
        userId: user1._id,
        instrument: 'Guitar',
        skillLevel: 'Advanced',
        yearsExperience: 5,
        isPrimary: true
      });
      await newGuitar.save();
      console.log('✅ Added Guitar for test_guitarist');
    } else {
      console.log('ℹ️ Guitar already added for test_guitarist');
    }
    
    // User 2: Drummer
    let user2 = await User.findOne({ email: 'test_drums@test.com' });
    if (!user2) {
      user2 = new User({
        username: 'test_drummer',
        email: 'test_drums@test.com',
        password: await bcrypt.hash('password123', 10),
        roles: ['drummer']
      });
      await user2.save();
      console.log('✅ Created drummer user');
    } else {
      console.log('ℹ️ Drummer user already exists');
    }
    
    // Add Drums instrument for user 2
    const drums = await UserInstrument.findOne({ userId: user2._id, instrument: 'Drums' });
    if (!drums) {
      const newDrums = new UserInstrument({
        userId: user2._id,
        instrument: 'Drums',
        skillLevel: 'Professional',
        yearsExperience: 8,
        isPrimary: true
      });
      await newDrums.save();
      console.log('✅ Added Drums for test_drummer');
    } else {
      console.log('ℹ️ Drums already added for test_drummer');
    }
    
    console.log('\n🎉 Test data ready!');
    console.log('\nTest accounts:');
    console.log('1. test_guitar@test.com / password123 (Guitar)');
    console.log('2. test_drums@test.com / password123 (Drums)');
    console.log('\nYou can now login and search for collaborators!\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

addTestData();