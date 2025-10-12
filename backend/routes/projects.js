const express = require('express');
const router = express.Router();
const Project = require('../models/Project');
const Track = require('../models/Track');
const auth = require('../middleware/auth');
const multer = require('multer');
const fs = require('fs');
const path = require('path');

const uploadDir = 'uploads/';
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir);
}

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}_${file.originalname}`);
  }
});

const upload = multer({ storage: storage });

// CRITICAL FIX: Helper function to normalize project response - returns BOTH id and _id for compatibility
const normalizeProject = (project) => {
  const obj = project.toObject();
  return {
    ...obj,
    id: project._id.toString(),
    _id: project._id.toString() // Keep _id for backward compatibility
  };
};

// FIXED: Helper function to normalize track response  
const normalizeTrack = (track) => {
  const obj = track.toObject();
  return {
    ...obj,
    id: track._id.toString(),
    _id: track._id.toString()
  };
};

// CRITICAL FIX: Move specific routes BEFORE parameterized routes
// @route GET /api/projects/my - Get user's projects (SECURED)  
router.get('/my', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    const projects = await Project.find({
      $or: [
        { owner_id: userId },
        { collaborators: userId }
      ]
    }).sort({ created_at: -1 });
    
    res.json(projects.map(normalizeProject));
  } catch (err) {
    console.error('Get my projects error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route POST /api/projects - Create new project (SECURED)
router.post('/', auth, async (req, res) => {
  const { title, description, mode, tempo, master_volume } = req.body;
  
  try {
    const newProject = new Project({
      title: title || 'Untitled Project',
      description: description || '',
      mode: mode || 'solo',
      tempo: tempo || 120,
      master_volume: master_volume || 0.8,
      owner_id: req.user.id,
      collaborators: []
    });
    
    await newProject.save();
    
    // CRITICAL FIX: Return properly formatted response with both id and _id
    const response = normalizeProject(newProject);
    console.log('Project created with ID:', response._id);
    
    res.status(201).json(response);
  } catch (err) {
    console.error('Project creation error:', err.message);
    res.status(500).json({ msg: 'Server error creating project' });
  }
});

// @route GET /api/projects/:id - Get single project with tracks
router.get('/:id', async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }
    
    const tracks = await Track.find({ project_id: req.params.id }).sort({ created_at: 1 });
    
    // Return normalized project with tracks
    const response = {
      ...normalizeProject(project),
      tracks: tracks.map(normalizeTrack)
    };
    
    res.json(response);
  } catch (err) {
    console.error('Get project error:', err.message);
    if (err.name === 'CastError') {
      return res.status(404).json({ msg: 'Project not found (Invalid ID format)' });
    }
    res.status(500).json({ msg: 'Server error' });
  }
});

// CRITICAL FIX: Add missing route for fetching project tracks
// @route GET /api/projects/:id/tracks - Get tracks for a specific project
router.get('/:id/tracks', async (req, res) => {
  try {
    const projectId = req.params.id;
    
    // Verify project exists
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }
    
    const tracks = await Track.find({ project_id: projectId }).sort({ created_at: 1 });
    res.json(tracks.map(normalizeTrack));
  } catch (err) {
    console.error('Get tracks error:', err.message);
    if (err.name === 'CastError') {
      return res.status(404).json({ msg: 'Invalid project ID format' });
    }
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route PUT /api/projects/:id - Update project settings (SECURED)
router.put('/:id', auth, async (req, res) => {
  try {
    const { tempo, master_volume, title, description } = req.body;
    
    const project = await Project.findById(req.params.id);
    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }
    
    // Check if user owns the project or is a collaborator
    if (project.owner_id.toString() !== req.user.id && 
        !project.collaborators.includes(req.user.id)) {
      return res.status(403).json({ msg: 'Unauthorized to edit this project' });
    }
    
    // Update fields if provided
    const updateFields = {};
    if (tempo !== undefined) updateFields.tempo = tempo;
    if (master_volume !== undefined) updateFields.master_volume = master_volume;
    if (title !== undefined) updateFields.title = title;
    if (description !== undefined) updateFields.description = description;
    
    const updatedProject = await Project.findByIdAndUpdate(
      req.params.id,
      { $set: updateFields },
      { new: true }
    );
    
    res.json(normalizeProject(updatedProject));
  } catch (err) {
    console.error('Project update error:', err.message);
    if (err.name === 'CastError') {
      return res.status(404).json({ msg: 'Invalid project ID format' });
    }
    res.status(500).json({ msg: 'Server error updating project' });
  }
});

// @route DELETE /api/projects/:id - Delete project (SECURED)
router.delete('/:id', auth, async (req, res) => {
  try {
    const project = await Project.findById(req.params.id);
    
    if (!project || project.owner_id.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Unauthorized or Project not found' });
    }
    
    // Delete all associated tracks first
    await Track.deleteMany({ project_id: req.params.id });
    
    // Delete the project
    await Project.findByIdAndDelete(req.params.id);
    
    res.json({ msg: 'Project and all associated tracks deleted successfully' });
  } catch (err) {
    console.error('Delete project error:', err.message);
    res.status(500).json({ msg: 'Server error' });
  }
});

// @route POST /api/projects/:id/tracks - Upload track to project (SECURED)
router.post('/:id/tracks', auth, upload.single('track'), async (req, res) => {
  try {
    console.log('=== TRACK UPLOAD DEBUG ===');
    console.log('req.params.id:', req.params.id);
    console.log('Type:', typeof req.params.id);
    console.log('========================');
    
    if (!req.file) {
      return res.status(400).json({ msg: 'No audio file uploaded' });
    }
    
    const { title, duration } = req.body;
    const projectId = req.params.id;
    const fileUrl = `/uploads/${req.file.filename}`;
    
    // Verify project exists and user has access
    const project = await Project.findById(projectId);
    if (!project) {
      return res.status(404).json({ msg: 'Project not found' });
    }
    
    if (project.owner_id.toString() !== req.user.id && 
        !project.collaborators.includes(req.user.id)) {
      return res.status(403).json({ msg: 'Unauthorized to add tracks to this project' });
    }
    
    const newTrack = new Track({
      project_id: projectId,
      title: title || req.file.originalname,
      duration: parseFloat(duration) || 0,
      file_url: fileUrl,
    });
    
    await newTrack.save();
    
    console.log('Track saved successfully:', newTrack._id);
    
    res.status(201).json(normalizeTrack(newTrack));
  } catch (err) {
    console.error('Track upload error:', err.message);
    console.error('Error stack:', err.stack);
    if (err.name === 'CastError') {
      return res.status(400).json({ msg: 'Invalid project ID format' });
    }
    res.status(500).json({ msg: 'Server error uploading track' });
  }
});

module.exports = router;