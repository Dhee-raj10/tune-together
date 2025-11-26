// backend/scripts/debugTracks.js - Run this to diagnose the issue
const mongoose = require('mongoose');
const Project = require('../models/Project');
const Track = require('../models/Track');
const CollaborationProject = require('../models/CollaborationProject');

mongoose.connect('mongodb://localhost:27017/tune_together')
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

async function debugTracks() {
  try {
    console.log('\n' + '='.repeat(80));
    console.log('🔍 TRACK PERSISTENCE DIAGNOSTIC TOOL');
    console.log('='.repeat(80) + '\n');

    // 1. Check Solo Projects
    console.log('1️⃣ CHECKING SOLO PROJECTS:');
    console.log('-'.repeat(80));
    
    const soloProjects = await Project.find();
    console.log(`\n   Found ${soloProjects.length} solo project(s)\n`);
    
    for (const project of soloProjects) {
      console.log(`   📁 Project: ${project.title}`);
      console.log(`      ID: ${project._id}`);
      console.log(`      Mode: ${project.mode}`);
      console.log(`      Owner: ${project.owner_id}`);
      
      // Check tracks for this project
      const tracks = await Track.find({ project_id: project._id });
      console.log(`      🎵 Tracks in Track collection: ${tracks.length}`);
      
      if (tracks.length > 0) {
        tracks.forEach((track, i) => {
          console.log(`         ${i + 1}. ${track.title}`);
          console.log(`            File: ${track.file_url}`);
          console.log(`            Created: ${track.created_at}`);
        });
      } else {
        console.log(`         ❌ NO TRACKS FOUND FOR THIS PROJECT`);
      }
      console.log();
    }

    // 2. Check Collaborative Projects
    console.log('\n2️⃣ CHECKING COLLABORATIVE PROJECTS:');
    console.log('-'.repeat(80));
    
    const collabProjects = await CollaborationProject.find();
    console.log(`\n   Found ${collabProjects.length} collaborative project(s)\n`);
    
    for (const project of collabProjects) {
      console.log(`   📁 Project: ${project.name}`);
      console.log(`      ID: ${project._id}`);
      console.log(`      Session ID: ${project.sessionId}`);
      console.log(`      Collaborators: ${project.collaborators.length}`);
      console.log(`      🎵 Tracks (embedded in project): ${project.tracks.length}`);
      
      if (project.tracks.length > 0) {
        project.tracks.forEach((track, i) => {
          console.log(`         ${i + 1}. ${track.name}`);
          console.log(`            File: ${track.audioFileUrl}`);
          console.log(`            Created by: ${track.createdBy}`);
          console.log(`            AI Generated: ${track.isAIGenerated}`);
          console.log(`            Created: ${track.createdAt}`);
        });
      } else {
        console.log(`         ❌ NO TRACKS IN THIS COLLABORATIVE PROJECT`);
      }
      
      // Also check if there are orphaned tracks in Track collection
      const orphanedTracks = await Track.find({ project_id: project._id });
      if (orphanedTracks.length > 0) {
        console.log(`\n      ⚠️ WARNING: Found ${orphanedTracks.length} orphaned tracks in Track collection`);
        console.log(`         (These should be in CollaborationProject.tracks instead)`);
      }
      console.log();
    }

    // 3. Check orphaned tracks
    console.log('\n3️⃣ CHECKING FOR ORPHANED TRACKS:');
    console.log('-'.repeat(80));
    
    const allTracks = await Track.find();
    console.log(`\n   Total tracks in Track collection: ${allTracks.length}\n`);
    
    for (const track of allTracks) {
      const soloProject = await Project.findById(track.project_id);
      const collabProject = await CollaborationProject.findById(track.project_id);
      
      if (!soloProject && !collabProject) {
        console.log(`   ⚠️ ORPHANED TRACK: ${track.title}`);
        console.log(`      Track ID: ${track._id}`);
        console.log(`      Project ID: ${track.project_id} (DOES NOT EXIST)`);
        console.log(`      File: ${track.file_url}`);
        console.log();
      }
    }

    console.log('='.repeat(80));
    console.log('✅ DIAGNOSTIC COMPLETE\n');
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error:', error);
    process.exit(1);
  }
}

debugTracks();