const express = require('express');
const router = express.Router();
const CollaborationProject = require('../models/CollaborationProject');
const { authenticate } = require('../middleware/auth');

// Get user's projects
router.get('/my-projects', authenticate, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    const projects = await CollaborationProject.find({
      'collaborators.userId': userId
    })
      .populate('collaborators.userId', 'username profilePicture')
      .sort({ updatedAt: -1 });

    res.json({ projects });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get specific project
router.get('/:projectId', authenticate, async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user._id || req.user.id;

    const project = await CollaborationProject.findById(projectId)
      .populate('collaborators.userId', 'username profilePicture');

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check access
    const hasAccess = project.collaborators.some(
      c => c.userId._id.toString() === userId.toString()
    );

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    res.json({ project });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update project
router.put('/:projectId', authenticate, async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user._id || req.user.id;
    const { name, description, bpm, timeSignature, keySignature } = req.body;

    const project = await CollaborationProject.findById(projectId);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check permissions
    const collaborator = project.collaborators.find(
      c => c.userId.toString() === userId.toString()
    );

    if (!collaborator || collaborator.permissions === 'view') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // Update fields
    if (name) project.name = name;
    if (description) project.description = description;
    if (bpm) project.bpm = bpm;
    if (timeSignature) project.timeSignature = timeSignature;
    if (keySignature) project.keySignature = keySignature;

    await project.save();

    res.json({ project });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete project
router.delete('/:projectId', authenticate, async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user._id || req.user.id;

    const project = await CollaborationProject.findById(projectId);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // Check if user is admin
    const collaborator = project.collaborators.find(
      c => c.userId.toString() === userId.toString()
    );

    if (!collaborator || collaborator.permissions !== 'admin') {
      return res.status(403).json({ error: 'Only admin can delete project' });
    }

    await project.deleteOne();

    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;