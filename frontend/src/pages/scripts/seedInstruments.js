const mongoose = require('mongoose');
const User = require('../models/User');
const UserInstrument = require('../models/UserInstrument');
const bcrypt = require('bcryptjs');

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/tune_together')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('MongoDB connection error:', err));

async function seedData() {
  try {
    // Create test users with instruments
    const users = [
      {
        username: 'alice_guitar',
        email: 'alice@test.com',
        password: await bcrypt.hash('password123', 10),
        roles: ['guitarist', 'vocalist']
      },
      {
        username: 'bob_drums',
        email: 'bob@test.com',
        password: await bcrypt.hash('password123', 10),
        roles: ['drummer']
      },
      {
        username: 'charlie_piano',
        email: 'charlie@test.com',
        password: await bcrypt.hash('password123', 10),
        roles: ['pianist', 'composer']
      }
    ];

    console.log('Creating users...');
    
    for (const userData of users) {
      // Check if user exists
      let user = await User.findOne({ email: userData.email });
      
      if (!user) {
        user = new User(userData);
        await user.save();
        console.log(`✅ Created user: ${userData.username}`);
      } else {
        console.log(`ℹ️ User already exists: ${userData.username}`);
      }

      // Add instruments based on roles
      if (userData.roles.includes('guitarist')) {
        await UserInstrument.findOneAndUpdate(
          { userId: user._id, instrument: 'Guitar' },
          {
            userId: user._id,
            instrument: 'Guitar',
            skillLevel: 'Advanced',
            yearsExperience: 5,
            isPrimary: true
          },
          { upsert: true, new: true }
        );
        console.log(`  ✅ Added Guitar for ${userData.username}`);
      }

      if (userData.roles.includes('drummer')) {
        await UserInstrument.findOneAndUpdate(
          { userId: user._id, instrument: 'Drums' },
          {
            userId: user._id,
            instrument: 'Drums',
            skillLevel: 'Professional',
            yearsExperience: 8,
            isPrimary: true
          },
          { upsert: true, new: true }
        );
        console.log(`  ✅ Added Drums for ${userData.username}`);
      }

      if (userData.roles.includes('pianist')) {
        await UserInstrument.findOneAndUpdate(
          { userId: user._id, instrument: 'Piano' },
          {
            userId: user._id,
            instrument: 'Piano',
            skillLevel: 'Intermediate',
            yearsExperience: 3,
            isPrimary: true
          },
          { upsert: true, new: true }
        );
        console.log(`  ✅ Added Piano for ${userData.username}`);
      }

      if (userData.roles.includes('vocalist')) {
        await UserInstrument.findOneAndUpdate(
          { userId: user._id, instrument: 'Vocals' },
          {
            userId: user._id,
            instrument: 'Vocals',
            skillLevel: 'Advanced',
            yearsExperience: 4,
            isPrimary: false
          },
          { upsert: true, new: true }
        );
        console.log(`  ✅ Added Vocals for ${userData.username}`);
      }
    }

    console.log('\n🎉 Seed data created successfully!');
    console.log('\nTest Users:');
    console.log('1. alice@test.com / password123 (Guitar, Vocals)');
    console.log('2. bob@test.com / password123 (Drums)');
    console.log('3. charlie@test.com / password123 (Piano)');
    
    process.exit(0);
  } catch (error) {
    console.error('Error seeding data:', error);
    process.exit(1);
  }
}

seedData();