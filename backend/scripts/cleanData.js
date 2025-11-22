const mongoose = require('mongoose');
const UserInstrument = require('../models/UserInstrument');

mongoose.connect('mongodb://localhost:27017/tune_together')
  .then(() => console.log('✅ Connected'))
  .catch(err => console.error('❌ Error:', err));

function cleanInstrumentName(instrument) {
  if (!instrument) return '';
  return instrument
    .replace(/[\u{1F300}-\u{1F9FF}]/gu, '')
    .replace(/[\u{2600}-\u{26FF}]/gu, '')
    .trim();
}

async function cleanData() {
  try {
    console.log('\n🧹 CLEANING INSTRUMENT DATA\n');
    
    const instruments = await UserInstrument.find({});
    
    console.log(`Found ${instruments.length} instruments to check\n`);
    
    let cleaned = 0;
    
    for (const inst of instruments) {
      const originalName = inst.instrument;
      const cleanedName = cleanInstrumentName(originalName);
      
      if (originalName !== cleanedName) {
        console.log(`🧹 Cleaning: "${originalName}" -> "${cleanedName}"`);
        inst.instrument = cleanedName;
        await inst.save();
        cleaned++;
      }
    }
    
    console.log(`\n✅ Cleaned ${cleaned} instruments`);
    console.log(`✅ ${instruments.length - cleaned} were already clean\n`);
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

cleanData();