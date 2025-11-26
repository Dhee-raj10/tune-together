// backend/routes/tracks.js - COMPLETE REPLACEMENT
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../config/upload');
const Track = require('../models/Track');
const Project = require('../models/Project');
const CollaborationProject = require('../models/CollaborationProject');

// ✅ UPLOAD TRACK - Works for both solo and collaborative projects
router.post('/:projectId/tracks', auth, upload.single('track'), async (req, res) => {
  try {
    const { projectId } = req.params;
    const { title, duration } = req.body;
    const userId = req.user.id;

    if (!req.file) {
      return res.status(400).json({ msg: 'No file uploaded' });
    }

    console.log('📁 File uploaded:', req.file.filename);
    console.log('📦 Project ID:', projectId);
    console.log('👤 User ID:', userId);

    // ✅ STEP 1: Try to find project (solo first, then collaborative)
    let project = await Project.findById(projectId);
    let isCollaborative = false;

    if (!project) {
      project = await CollaborationProject.findById(projectId);
      isCollaborative = true;
    }

    if (!project) {
      console.log('❌ Project not found');
      return res.status(404).json({ msg: 'Project not found' });
    }

    console.log('✅ Found project:', isCollaborative ? 'COLLABORATIVE' : 'SOLO');

    // ✅ STEP 2: Verify access
    if (isCollaborative) {
      const hasAccess = project.collaborators.some(
        c => c.userId && c.userId.toString() === userId.toString()
      );
      if (!hasAccess) {
        console.log('❌ Access denied - not a collaborator');
        return res.status(403).json({ msg: 'Access denied' });
      }
    } else {
      if (project.owner_id.toString() !== userId.toString()) {
        console.log('❌ Access denied - not owner');
        return res.status(403).json({ msg: 'Access denied' });
      }
    }

    // ✅ STEP 3: Save track differently based on project type
    if (isCollaborative) {
      // For collaborative: Add to project's tracks array
      const newTrack = {
        name: title || req.file.originalname.replace(/\.[^/.]+$/, ''),
        instrument: 'Unknown',
        audioFileUrl: `/uploads/${req.file.filename}`,
        duration: parseFloat(duration) || 0,
        createdBy: userId,
        trackOrder: project.tracks.length,
        isAIGenerated: false,
        createdAt: new Date()
      };

      project.tracks.push(newTrack);
      await project.save();

      const savedTrack = project.tracks[project.tracks.length - 1];
      
      console.log('✅ Track saved to COLLABORATIVE project:', savedTrack._id);
      console.log('   Total tracks in project:', project.tracks.length);

      // ✅ Emit socket event if available
      const io = req.app.locals.io;
      if (io) {
        io.to(project.sessionId).emit('track-added', {
          track: savedTrack,
          addedBy: userId,
          projectId: projectId
        });
      }

      return res.status(201).json({
        id: savedTrack._id,
        _id: savedTrack._id,
        title: savedTrack.name,
        name: savedTrack.name,
        file_url: savedTrack.audioFileUrl,
        audioFileUrl: savedTrack.audioFileUrl,
        duration: savedTrack.duration,
        created_at: savedTrack.createdAt
      });

    } else {
      // For solo: Create Track document
      const newTrack = new Track({
        project_id: projectId,
        title: title || req.file.originalname.replace(/\.[^/.]+$/, ''),
        duration: parseFloat(duration) || 0,
        file_url: `/uploads/${req.file.filename}`,
        created_at: new Date()
      });

      await newTrack.save();
      
      console.log('✅ Track saved to SOLO project Track collection:', newTrack._id);

      return res.status(201).json({
        id: newTrack._id,
        _id: newTrack._id,
        title: newTrack.title,
        duration: newTrack.duration,
        file_url: newTrack.file_url,
        created_at: newTrack.created_at
      });
    }

  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({ 
      msg: 'Server error uploading track',
      error: error.message 
    });
  }
});

// ✅ GET ALL TRACKS - Works for both project types
router.get('/:projectId/tracks', auth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    console.log('🎵 GET tracks for project:', projectId);

    // Try solo project first
    let project = await Project.findById(projectId);
    let isCollaborative = false;

    if (!project) {
      project = await CollaborationProject.findById(projectId);
      isCollaborative = true;
    }

    if (!project) {
      console.log('❌ Project not found');
      return res.status(404).json({ msg: 'Project not found' });
    }

    console.log('✅ Found project:', isCollaborative ? 'COLLABORATIVE' : 'SOLO');

    // Verify access
    if (isCollaborative) {
      const hasAccess = project.collaborators.some(
        c => c.userId && c.userId.toString() === userId.toString()
      );
      if (!hasAccess) {
        console.log('❌ Access denied');
        return res.status(403).json({ msg: 'Access denied' });
      }
    } else {
      if (project.owner_id.toString() !== userId.toString()) {
        console.log('❌ Access denied');
        return res.status(403).json({ msg: 'Access denied' });
      }
    }

    let tracks;

    if (isCollaborative) {
      // Return embedded tracks
      tracks = project.tracks || [];
      console.log(`✅ Returning ${tracks.length} tracks from collaborative project`);
    } else {
      // Query Track collection
      tracks = await Track.find({ project_id: projectId }).sort({ created_at: 1 });
      console.log(`✅ Returning ${tracks.length} tracks from Track collection`);
    }

    res.json(tracks);

  } catch (error) {
    console.error('❌ Get tracks error:', error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
});

// ✅ DELETE TRACK - Works for both project types
router.delete('/:projectId/tracks/:trackId', auth, async (req, res) => {
  try {
    const { projectId, trackId } = req.params;
    const userId = req.user.id;

    console.log('🗑️ DELETE track:', trackId, 'from project:', projectId);

    let project = await Project.findById(projectId);
    let isCollaborative = false;

    if (!project) {
      project = await CollaborationProject.findById(projectId);
      isCollaborative = true;
    }

    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }

    if (isCollaborative) {
      const hasAccess = project.collaborators.some(
        c => c.userId && c.userId.toString() === userId.toString()
      );
      if (!hasAccess) {
        return res.status(403).json({ msg: 'Access denied' });
      }

      // Remove from tracks array
      project.tracks = project.tracks.filter(t => t._id.toString() !== trackId);
      await project.save();
      
      console.log('✅ Track removed from collaborative project');

    } else {
      if (project.owner_id.toString() !== userId.toString()) {
        return res.status(403).json({ msg: 'Access denied' });
      }

      const track = await Track.findById(trackId);
      if (!track) {
        return res.status(404).json({ msg: 'Track not found' });
      }

      await track.deleteOne();
      console.log('✅ Track deleted from Track collection');
    }

    res.json({ msg: 'Track deleted successfully' });

  } catch (error) {
    console.error('❌ Delete track error:', error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
});

module.exports = router;