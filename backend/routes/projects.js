// backend/routes/projects.js - COMPLETE REPLACEMENT
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const Project = require('../models/Project');
const CollaborationProject = require('../models/CollaborationProject');

// ✅ CREATE PROJECT - Supports both solo and collaborative
router.post('/', auth, async (req, res) => {
  try {
    const { title, description, mode, owner_id, tempo, master_volume } = req.body;
    const userId = req.user.id || req.user._id || req.user.userId;

    console.log('📝 Creating project:', { title, mode, userId });

    if (mode === 'collaborative') {
      const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      
      const collabProject = new CollaborationProject({
        name: title,
        description: description || '',
        sessionId,
        bpm: tempo || 120,
        collaborators: [
          { userId, role: 'creator', permissions: 'admin' }
        ],
        tracks: [],
        status: 'active'
      });

      await collabProject.save();
      console.log('✅ Collaboration project created:', collabProject._id);

      return res.status(201).json({
        id: collabProject._id,
        _id: collabProject._id,
        title: collabProject.name,
        name: collabProject.name,
        description: collabProject.description,
        mode: 'collaborative',
        sessionId: collabProject.sessionId,
        bpm: collabProject.bpm,
        created_at: collabProject.createdAt
      });
    } else {
      const soloProject = new Project({
        title,
        description,
        mode: mode || 'solo',
        owner_id: userId,
        tempo: tempo || 120,
        master_volume: master_volume || 0.8,
        collaborators: []
      });

      await soloProject.save();
      console.log('✅ Solo project created:', soloProject._id);

      return res.status(201).json({
        id: soloProject._id,
        _id: soloProject._id,
        title: soloProject.title,
        description: soloProject.description,
        mode: soloProject.mode,
        tempo: soloProject.tempo,
        created_at: soloProject.created_at || new Date()
      });
    }
  } catch (error) {
    console.error('❌ Create project error:', error);
    res.status(500).json({ 
      error: 'Server error creating project',
      details: error.message 
    });
  }
});

// ✅ GET PROJECT BY ID
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id || req.user._id;

    console.log('📂 GET project:', id, 'for user:', userId);

    let project = await Project.findById(id);
    
    if (project) {
      if (project.owner_id.toString() !== userId.toString()) {
        console.log('❌ Access denied - not owner');
        return res.status(403).json({ error: 'Access denied' });
      }
      console.log('✅ Found SOLO project:', project.title);
      return res.json(project);
    }

    const collabProject = await CollaborationProject.findById(id)
      .populate('collaborators.userId', 'username');

    if (collabProject) {
      const hasAccess = collabProject.collaborators.some(
        c => c.userId && c.userId._id.toString() === userId.toString()
      );
      if (!hasAccess) {
        console.log('❌ Access denied - not collaborator');
        return res.status(403).json({ error: 'Access denied' });
      }
      console.log('✅ Found COLLABORATIVE project:', collabProject.name);
      console.log('   Tracks in project:', collabProject.tracks.length);
      return res.json(collabProject);
    }

    console.log('❌ Project not found');
    return res.status(404).json({ error: 'Project not found' });
  } catch (error) {
    console.error('❌ Get project error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ GET ALL USER'S PROJECTS
router.get('/', auth, async (req, res) => {
  try {
    const userId = req.user.id || req.user._id;

    console.log('📂 GET all projects for user:', userId);

    const soloProjects = await Project.find({ owner_id: userId });
    const collabProjects = await CollaborationProject.find({
      'collaborators.userId': userId
    });

    console.log(`✅ Found ${soloProjects.length} solo + ${collabProjects.length} collaborative projects`);

    const allProjects = [
      ...soloProjects.map(p => ({ ...p._doc, mode: p.mode || 'solo' })),
      ...collabProjects.map(p => ({ ...p._doc, mode: 'collaborative' }))
    ];

    res.json(allProjects);
  } catch (error) {
    console.error('❌ Get projects error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ UPDATE PROJECT
router.put('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id || req.user._id;
    const updates = req.body;

    console.log('💾 UPDATE project:', id);
    console.log('   Updates:', updates);

    let project = await Project.findById(id);
    
    if (project) {
      if (project.owner_id.toString() !== userId.toString()) {
        return res.status(403).json({ error: 'Access denied' });
      }
      Object.assign(project, updates);
      await project.save();
      console.log('✅ Solo project updated');
      return res.json({ id: project._id, message: 'Project updated' });
    }

    const collabProject = await CollaborationProject.findById(id);
    if (collabProject) {
      const collaborator = collabProject.collaborators.find(
        c => c.userId && c.userId.toString() === userId.toString()
      );
      if (!collaborator || collaborator.permissions === 'view') {
        return res.status(403).json({ error: 'Insufficient permissions' });
      }
      if (updates.title) collabProject.name = updates.title;
      if (updates.description) collabProject.description = updates.description;
      if (updates.tempo || updates.bpm) collabProject.bpm = updates.tempo || updates.bpm;
      await collabProject.save();
      console.log('✅ Collaborative project updated');
      console.log('   Tracks preserved:', collabProject.tracks.length);
      return res.json({ id: collabProject._id, message: 'Project updated', project: collabProject });
    }

    return res.status(404).json({ error: 'Project not found' });
  } catch (error) {
    console.error('❌ Update project error:', error);
    res.status(500).json({ error: error.message });
  }
});

// ✅ DELETE PROJECT
router.delete('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id || req.user._id;

    let project = await Project.findById(id);
    if (project) {
      if (project.owner_id.toString() !== userId.toString()) {
        return res.status(403).json({ error: 'Access denied' });
      }
      await project.deleteOne();
      return res.json({ message: 'Project deleted' });
    }

    const collabProject = await CollaborationProject.findById(id);
    if (collabProject) {
      const collaborator = collabProject.collaborators.find(
        c => c.userId && c.userId.toString() === userId.toString()
      );
      if (!collaborator || collaborator.permissions !== 'admin') {
        return res.status(403).json({ error: 'Only admin can delete' });
      }
      await collabProject.deleteOne();
      return res.json({ message: 'Project deleted' });
    }

    return res.status(404).json({ error: 'Project not found' });
  } catch (error) {
    console.error('❌ Delete project error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;