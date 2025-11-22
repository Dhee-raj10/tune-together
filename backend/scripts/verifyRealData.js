const mongoose = require('mongoose');
const User = require('../models/User');
const UserInstrument = require('../models/UserInstrument');

mongoose.connect('mongodb://localhost:27017/tune_together')
  .then(() => console.log('✅ Connected'))
  .catch(err => console.error('❌ Error:', err));

async function verify() {
  try {
    console.log('\n🔍 VERIFYING REAL USER DATA (NO MOCK)\n');
    console.log('='.repeat(60));
    
    // Get all users
    const users = await User.find({}).select('username email roles createdAt');
    
    console.log(`\n📊 TOTAL USERS: ${users.length}\n`);
    
    if (users.length === 0) {
      console.log('❌ NO USERS FOUND!');
      console.log('   Action needed: Sign up through the frontend\n');
      process.exit(0);
    }
    
    // Check each user
    for (const user of users) {
      console.log('─'.repeat(60));
      console.log(`\n👤 USER: ${user.username} (${user.email})`);
      console.log(`   ID: ${user._id}`);
      console.log(`   Created: ${user.createdAt}`);
      
      // Check roles
      console.log(`\n   📋 ROLES:`);
      if (user.roles && user.roles.length > 0) {
        console.log(`      ✅ Has ${user.roles.length} role(s):`);
        user.roles.forEach(role => console.log(`         - ${role}`));
      } else {
        console.log(`      ❌ NO ROLES SET`);
        console.log(`      Action: User needs to complete profile setup`);
      }
      
      // Check instruments
      const instruments = await UserInstrument.find({ userId: user._id });
      console.log(`\n   🎸 INSTRUMENTS:`);
      if (instruments.length > 0) {
        console.log(`      ✅ Has ${instruments.length} instrument(s):`);
        instruments.forEach(inst => {
          console.log(`         - ${inst.instrument} (${inst.skillLevel}, ${inst.yearsExperience} years)${inst.isPrimary ? ' ⭐ PRIMARY' : ''}`);
          console.log(`           Saved: ${inst.createdAt}`);
        });
      } else {
        console.log(`      ❌ NO INSTRUMENTS`);
        console.log(`      Action: User needs to add instruments in profile`);
      }
      
      // Determine if user is searchable
      const isSearchable = (user.roles && user.roles.length > 0) && instruments.length > 0;
      console.log(`\n   🔍 SEARCHABLE: ${isSearchable ? '✅ YES' : '❌ NO'}`);
      
      if (!isSearchable) {
        console.log(`      This user will NOT appear in collaborator searches`);
      }
      
      console.log();
    }
    
    console.log('='.repeat(60));
    console.log('\n✅ VERIFICATION COMPLETE\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

verify();