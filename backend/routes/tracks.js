const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const upload = require('../config/upload');
const Track = require('../models/Track');
const Project = require('../models/Project');
const CollaborationProject = require('../models/CollaborationProject');

// @route POST /api/projects/:projectId/tracks
// @desc Upload a track to a project
// @access Private
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

    // Check if project exists and user has access
    let project = await Project.findById(projectId);
    let isCollaborative = false;

    if (!project) {
      // Try collaborative project
      project = await CollaborationProject.findById(projectId);
      isCollaborative = true;
    }

    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }

    // Verify access
    if (isCollaborative) {
      const hasAccess = project.collaborators.some(
        c => c.userId && c.userId.toString() === userId.toString()
      );
      if (!hasAccess) {
        return res.status(403).json({ msg: 'Access denied' });
      }
    } else {
      if (project.owner_id.toString() !== userId.toString()) {
        return res.status(403).json({ msg: 'Access denied' });
      }
    }

    // Create track
    const newTrack = new Track({
      project_id: projectId,
      title: title || req.file.originalname,
      duration: parseFloat(duration) || 0,
      file_url: `/uploads/${req.file.filename}`,
      created_at: new Date()
    });

    await newTrack.save();

    console.log('✅ Track saved:', newTrack._id);

    res.status(201).json({
      id: newTrack._id,
      _id: newTrack._id,
      title: newTrack.title,
      duration: newTrack.duration,
      file_url: newTrack.file_url,
      created_at: newTrack.created_at
    });

  } catch (error) {
    console.error('❌ Upload error:', error);
    res.status(500).json({ 
      msg: 'Server error uploading track',
      error: error.message 
    });
  }
});

// @route GET /api/projects/:projectId/tracks
// @desc Get all tracks for a project
// @access Private
router.get('/:projectId/tracks', auth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id;

    // Verify access (same as above)
    let project = await Project.findById(projectId);
    let isCollaborative = false;

    if (!project) {
      project = await CollaborationProject.findById(projectId);
      isCollaborative = true;
    }

    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }

    // Verify access
    if (isCollaborative) {
      const hasAccess = project.collaborators.some(
        c => c.userId && c.userId.toString() === userId.toString()
      );
      if (!hasAccess) {
        return res.status(403).json({ msg: 'Access denied' });
      }
    } else {
      if (project.owner_id.toString() !== userId.toString()) {
        return res.status(403).json({ msg: 'Access denied' });
      }
    }

    const tracks = await Track.find({ project_id: projectId }).sort({ created_at: 1 });

    res.json(tracks);

  } catch (error) {
    console.error('Error fetching tracks:', error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
});

// @route DELETE /api/projects/:projectId/tracks/:trackId
// @desc Delete a track
// @access Private
router.delete('/:projectId/tracks/:trackId', auth, async (req, res) => {
  try {
    const { projectId, trackId } = req.params;
    const userId = req.user.id;

    // Verify access
    let project = await Project.findById(projectId);
    if (!project) {
      project = await CollaborationProject.findById(projectId);
    }

    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }

    const track = await Track.findById(trackId);
    if (!track) {
      return res.status(404).json({ msg: 'Track not found' });
    }

    await track.deleteOne();

    res.json({ msg: 'Track deleted successfully' });

  } catch (error) {
    console.error('Error deleting track:', error);
    res.status(500).json({ msg: 'Server error', error: error.message });
  }
});

module.exports = router;