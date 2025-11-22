const mongoose = require('mongoose');
const UserInstrument = require('../models/UserInstrument');
const User = require('../models/User');

mongoose.connect('mongodb://localhost:27017/tune_together')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

async function debugSearch() {
  try {
    console.log('\n🔍 DEBUGGING COLLABORATOR SEARCH\n');
    console.log('='.repeat(50));
    
    // 1. Check all users
    const users = await User.find({}, { username: 1, email: 1 });
    console.log('\n1️⃣ USERS IN DATABASE:');
    console.log(`Total users: ${users.length}`);
    users.forEach(user => {
      console.log(`  - ${user.username} (${user.email}) - ID: ${user._id}`);
    });
    
    // 2. Check all instruments
    const instruments = await UserInstrument.find().populate('userId', 'username email');
    console.log('\n2️⃣ INSTRUMENTS IN DATABASE:');
    console.log(`Total instruments: ${instruments.length}`);
    instruments.forEach(inst => {
      console.log(`  - User: ${inst.userId?.username || 'NULL'} | Instrument: ${inst.instrument} | Skill: ${inst.skillLevel} | Years: ${inst.yearsExperience}`);
    });
    
    // 3. Test search query for Drums
    console.log('\n3️⃣ TESTING SEARCH FOR "Drums":');
    const drumsQuery = { instrument: 'Drums' };
    const drumsResults = await UserInstrument.find(drumsQuery).populate('userId', 'username');
    console.log(`Query: ${JSON.stringify(drumsQuery)}`);
    console.log(`Results found: ${drumsResults.length}`);
    drumsResults.forEach(result => {
      console.log(`  - Found: ${result.userId?.username} plays ${result.instrument}`);
    });
    
    // 4. Test search query for Guitar
    console.log('\n4️⃣ TESTING SEARCH FOR "Guitar":');
    const guitarQuery = { instrument: 'Guitar' };
    const guitarResults = await UserInstrument.find(guitarQuery).populate('userId', 'username');
    console.log(`Query: ${JSON.stringify(guitarQuery)}`);
    console.log(`Results found: ${guitarResults.length}`);
    guitarResults.forEach(result => {
      console.log(`  - Found: ${result.userId?.username} plays ${result.instrument}`);
    });
    
    // 5. Group instruments by name
    console.log('\n5️⃣ INSTRUMENTS GROUPED BY NAME:');
    const grouped = await UserInstrument.aggregate([
      { $group: { _id: '$instrument', count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);
    grouped.forEach(group => {
      console.log(`  - ${group._id}: ${group.count} user(s)`);
    });
    
    // 6. Check for orphaned instruments (userId doesn't exist)
    console.log('\n6️⃣ CHECKING FOR ORPHANED INSTRUMENTS:');
    const allInstruments = await UserInstrument.find();
    let orphanCount = 0;
    for (const inst of allInstruments) {
      const userExists = await User.findById(inst.userId);
      if (!userExists) {
        orphanCount++;
        console.log(`  ⚠️ Orphaned: Instrument ${inst.instrument} has invalid userId: ${inst.userId}`);
      }
    }
    if (orphanCount === 0) {
      console.log(`  ✅ No orphaned instruments found`);
    }
    
    console.log('\n' + '='.repeat(50));
    console.log('✅ Debug complete\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error during debug:', error);
    process.exit(1);
  }
}

debugSearch();