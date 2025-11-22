const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../config/upload');
const CollaborationProject = require('../models/CollaborationProject');

// @route POST /api/collaboration/projects/:projectId/tracks
// @desc Upload track to collaboration project
// @access Private
router.post('/:projectId/tracks', auth, upload.single('track'), async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, duration, instrument, isAIGenerated, aiMetadata } = req.body;
    const userId = req.user.id || req.user._id;

    console.log('📁 Uploading track to collaboration project:', projectId);
    console.log('   User:', userId);
    console.log('   Title:', title);
    console.log('   AI Generated:', isAIGenerated);

    // Find project and verify access
    const project = await CollaborationProject.findById(projectId);
    
    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }

    // Verify user is a collaborator
    const hasAccess = project.collaborators.some(
      c => c.userId && c.userId.toString() === userId.toString()
    );

    if (!hasAccess) {
      return res.status(403).json({ msg: 'Access denied' });
    }

    // Create new track
    const newTrack = {
      name: title || (req.file ? req.file.originalname : 'Untitled Track'),
      instrument: instrument || 'Unknown',
      createdBy: userId,
      audioFileUrl: req.file ? `/uploads/${req.file.filename}` : null,
      duration: parseFloat(duration) || 0,
      volume: 1.0,
      pan: 0,
      isMuted: false,
      isSolo: false,
      trackOrder: project.tracks.length,
      isAIGenerated: isAIGenerated === 'true' || isAIGenerated === true,
      aiMetadata: aiMetadata ? JSON.parse(aiMetadata) : null
    };

    // Add track to project
    project.tracks.push(newTrack);
    await project.save();

    const savedTrack = project.tracks[project.tracks.length - 1];

    console.log('✅ Track saved to collaboration project:', savedTrack._id);

    // Emit socket event to notify other collaborators
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

// @route GET /api/collaboration/projects/:projectId/tracks
// @desc Get all tracks for a collaboration project
// @access Private
router.get('/:projectId/tracks', auth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id || req.user._id;

    console.log('📖 Fetching tracks for collaboration project:', projectId);

    const project = await CollaborationProject.findById(projectId)
      .populate('tracks.createdBy', 'username');

    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }

    // Verify access
    const hasAccess = project.collaborators.some(
      c => c.userId && c.userId.toString() === userId.toString()
    );

    if (!hasAccess) {
      return res.status(403).json({ msg: 'Access denied' });
    }

    console.log(`✅ Found ${project.tracks.length} tracks`);

    res.json(project.tracks);

  } catch (error) {
    console.error('❌ Fetch tracks error:', error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
});

// @route DELETE /api/collaboration/projects/:projectId/tracks/:trackId
// @desc Delete a track from collaboration project
// @access Private
router.delete('/:projectId/tracks/:trackId', auth, async (req, res) => {
  try {
    const { projectId, trackId } = req.params;
    const userId = req.user.id || req.user._id;

    console.log('🗑️ Deleting track:', trackId, 'from project:', projectId);

    const project = await CollaborationProject.findById(projectId);

    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }

    // Verify access
    const hasAccess = project.collaborators.some(
      c => c.userId && c.userId.toString() === userId.toString()
    );

    if (!hasAccess) {
      return res.status(403).json({ msg: 'Access denied' });
    }

    // Remove track
    project.tracks = project.tracks.filter(
      t => t._id.toString() !== trackId
    );

    await project.save();

    console.log('✅ Track deleted');

    // Emit socket event
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