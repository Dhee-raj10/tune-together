const express = require('express');
const router = express.Router();
const CollaborationProject = require('../models/CollaborationProject');
const auth = require('../middleware/auth');

// Get user's projects
router.get('/my-projects', auth, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    const projects = await CollaborationProject.find({ 'collaborators.userId': userId })
      .populate('collaborators.userId', 'username avatar_url')
      .sort({ updatedAt: -1 });

    console.log(`📂 Found ${projects.length} collaborative projects for user ${userId}`);
    res.json({ projects });
  } catch (error) {
    console.error('❌ Get my projects error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get specific project
router.get('/:projectId', auth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id || req.user._id;

    const project = await CollaborationProject.findById(projectId)
      .populate('collaborators.userId', 'username avatar_url');

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const hasAccess = project.collaborators.some(
      c => c.userId && c.userId._id.toString() === userId.toString()
    );

    if (!hasAccess) {
      return res.status(403).json({ error: 'Access denied' });
    }

    console.log(`✅ Project fetched: ${projectId}`);
    res.json({ project });
  } catch (error) {
    console.error('❌ Get project error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update project
/*router.put('/:projectId', auth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id || req.user._id;
    const { name, description, bpm, timeSignature, keySignature } = req.body;

    const project = await CollaborationProject.findById(projectId);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const collaborator = project.collaborators.find(
      c => c.userId && c.userId.toString() === userId.toString()
    );

    if (!collaborator || collaborator.permissions === 'view') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (bpm && bpm >= 40 && bpm <= 240) project.bpm = bpm;
    if (timeSignature) project.timeSignature = timeSignature;
    if (keySignature) project.keySignature = keySignature;

    await project.save();
    
    console.log(`✅ Project updated: ${projectId}`);
    res.json({ project });
  } catch (error) {
    console.error('❌ Update project error:', error);
    res.status(500).json({ error: error.message });
  }
});
*/
// ✅ PUT /api/collaboration/projects/:projectId
router.put('/:projectId', auth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id || req.user._id;
    const { name, description, bpm, timeSignature, keySignature, metadata } = req.body;

    const project = await CollaborationProject.findById(projectId);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    // ✅ Check user permission
    const collaborator = project.collaborators.find(
      c => c.userId && c.userId.toString() === userId.toString()
    );

    if (!collaborator || collaborator.permissions === 'view') {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    // ✅ Update fields
    if (name) project.name = name;
    if (description !== undefined) project.description = description;
    if (bpm && bpm >= 40 && bpm <= 240) project.bpm = bpm;
    if (timeSignature) project.timeSignature = timeSignature;
    if (keySignature) project.keySignature = keySignature;
    if (metadata) project.metadata = metadata;

    project.updatedAt = new Date();

    await project.save();

    const updatedProject = await CollaborationProject.findById(projectId)
      .populate('collaborators.userId', 'username avatar_url');

    console.log(`✅ Project updated successfully: ${projectId}`);
    res.json({ project: updatedProject });
  } catch (error) {
    console.error('❌ Update project error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Delete project
router.delete('/:projectId', auth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id || req.user._id;

    const project = await CollaborationProject.findById(projectId);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const collaborator = project.collaborators.find(
      c => c.userId && c.userId.toString() === userId.toString()
    );

    if (!collaborator || collaborator.permissions !== 'admin') {
      return res.status(403).json({ error: 'Only admin can delete project' });
    }

    await project.deleteOne();
    
    console.log(`✅ Project deleted: ${projectId}`);
    res.json({ message: 'Project deleted successfully' });
  } catch (error) {
    console.error('❌ Delete project error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Leave project (for non-admin collaborators)
router.post('/:projectId/leave', auth, async (req, res) => {
  try {
    const { projectId } = req.params;
    const userId = req.user.id || req.user._id;

    const project = await CollaborationProject.findById(projectId);

    if (!project) {
      return res.status(404).json({ error: 'Project not found' });
    }

    const collaboratorIndex = project.collaborators.findIndex(
      c => c.userId && c.userId.toString() === userId.toString()
    );

    if (collaboratorIndex === -1) {
      return res.status(404).json({ error: 'You are not a collaborator on this project' });
    }

    const isAdmin = project.collaborators[collaboratorIndex].permissions === 'admin';
    const adminCount = project.collaborators.filter(c => c.permissions === 'admin').length;

    if (isAdmin && adminCount === 1) {
      return res.status(400).json({ 
        error: 'Cannot leave: You are the only admin. Transfer admin rights first or delete the project.' 
      });
    }

    project.collaborators.splice(collaboratorIndex, 1);
    
    if (project.collaborators.length === 0) {
      await project.deleteOne();
      console.log(`✅ Project deleted (no collaborators left): ${projectId}`);
      return res.json({ message: 'Project deleted as there are no remaining collaborators' });
    }

    await project.save();
    
    console.log(`✅ User left project: ${projectId}`);
    res.json({ message: 'You have left the project' });
  } catch (error) {
    console.error('❌ Leave project error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;