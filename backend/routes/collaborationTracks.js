// backend/routes/collaborationTracks.js - COMPLETE REPLACEMENT
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../config/upload');
const CollaborationProject = require('../models/CollaborationProject');

// ✅ UPLOAD TRACK to collaborative project
router.post('/:projectId/tracks', auth, upload.single('track'), async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, duration, instrument, isAIGenerated, aiMetadata } = req.body;
    const userId = req.user.id || req.user._id;

    console.log('📁 Uploading track to collaborative project:', projectId);
    console.log('   User:', userId);
    console.log('   Title:', title);
    console.log('   File:', req.file?.originalname);

    const project = await CollaborationProject.findById(projectId);
    
    if (!project) {
      console.log('❌ Project not found');
      return res.status(404).json({ msg: 'Project not found' });
    }

    const hasAccess = project.collaborators.some(
      c => c.userId && c.userId.toString() === userId.toString()
    );

    if (!hasAccess) {
      console.log('❌ Access denied');
      return res.status(403).json({ msg: 'Access denied' });
    }

    if (!req.file) {
      console.log('❌ No file uploaded');
      return res.status(400).json({ msg: 'No file uploaded' });
    }

    // ✅ Create track object
    const newTrack = {
      name: title || req.file.originalname.replace(/\.[^/.]+$/, ''),
      instrument: instrument || 'Unknown',
      createdBy: userId,
      audioFileUrl: `/uploads/${req.file.filename}`,
      duration: parseFloat(duration) || 0,
      volume: 1.0,
      pan: 0,
      isMuted: false,
      isSolo: false,
      trackOrder: project.tracks.length,
      isAIGenerated: isAIGenerated === 'true' || isAIGenerated === true,
      aiMetadata: aiMetadata ? JSON.parse(aiMetadata) : null,
      createdAt: new Date()
    };

    // ✅ CRITICAL: Add track to project and SAVE
    project.tracks.push(newTrack);
    await project.save();

    const savedTrack = project.tracks[project.tracks.length - 1];

    console.log('✅ Track saved to collaborative project:', savedTrack._id);
    console.log('   Total tracks now:', project.tracks.length);

    // ✅ Emit socket event
    const io = req.app.locals.io;
    if (io) {
      io.to(project.sessionId).emit('track-added', {
        track: savedTrack,
        addedBy: userId,
        projectId: projectId
      });
      console.log('📡 Broadcasted track-added event');
    }

    res.status(201).json({
      id: savedTrack._id,
      _id: savedTrack._id,
      name: savedTrack.name,
      instrument: savedTrack.instrument,
      audioFileUrl: savedTrack.audioFileUrl,
      duration: savedTrack.duration,
      createdBy: savedTrack.createdBy,
      isAIGenerated: savedTrack.isAIGenerated,
      createdAt: savedTrack.createdAt
    });

  } catch (error) {
    console.error('❌ Upload track error:', error);
    res.status(500).json({ 
      msg: 'Server error uploading track',
      error: error.message 
    });
  }
});

// ✅ GET ALL TRACKS for collaborative project
router.get('/:projectId/tracks', auth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id || req.user._id;

    console.log('📖 Fetching tracks for collaborative project:', projectId);

    const project = await CollaborationProject.findById(projectId)
      .populate('tracks.createdBy', 'username');

    if (!project) {
      console.log('❌ Project not found');
      return res.status(404).json({ msg: 'Project not found' });
    }

    const hasAccess = project.collaborators.some(
      c => c.userId && c.userId.toString() === userId.toString()
    );

    if (!hasAccess) {
      console.log('❌ Access denied');
      return res.status(403).json({ msg: 'Access denied' });
    }

    console.log(`✅ Found ${project.tracks.length} tracks`);

    res.json(project.tracks);

  } catch (error) {
    console.error('❌ Fetch tracks error:', error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
});

// ✅ DELETE TRACK from collaborative project
router.delete('/:projectId/tracks/:trackId', auth, async (req, res) => {
  try {
    const { projectId, trackId } = req.params;
    const userId = req.user.id || req.user._id;

    console.log('🗑️ Deleting track:', trackId, 'from project:', projectId);

    const project = await CollaborationProject.findById(projectId);

    if (!project) {
      console.log('❌ Project not found');
      return res.status(404).json({ msg: 'Project not found' });
    }

    const hasAccess = project.collaborators.some(
      c => c.userId && c.userId.toString() === userId.toString()
    );

    if (!hasAccess) {
      console.log('❌ Access denied');
      return res.status(403).json({ msg: 'Access denied' });
    }

    // ✅ Remove track from array
    project.tracks = project.tracks.filter(
      t => t._id.toString() !== trackId
    );

    await project.save();

    console.log('✅ Track deleted');
    console.log('   Remaining tracks:', project.tracks.length);

    // ✅ Emit socket event
    const io = req.app.locals.io;
    if (io) {
      io.to(project.sessionId).emit('track-deleted', {
        trackId,
        deletedBy: userId,
        projectId: projectId
      });
    }

    res.json({ msg: 'Track deleted successfully' });

  } catch (error) {
    console.error('❌ Delete track error:', error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
});

module.exports = router;