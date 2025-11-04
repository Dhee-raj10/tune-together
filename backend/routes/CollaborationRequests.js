// backend/routes/collaborationRequests.js
const express = require('express');
const router = express.Router();
const CollaborationRequest = require('../models/CollaborationRequest');
const CollaborationProject = require('../models/CollaborationProject');

// Simple inline auth middleware
const authenticate = (req, res, next) => {
  try {
    const token = req.headers.authorization?.replace('Bearer ', '');
    if (!token) {
      return res.status(401).json({ error: 'Authentication required' });
    }
    
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      _id: decoded.userId || decoded.id || decoded._id,
      id: decoded.userId || decoded.id || decoded._id,
      username: decoded.username || decoded.name
    };
    next();
  } catch (error) {
    res.status(401).json({ error: 'Invalid token' });
  }
};

// Send collaboration request
router.post('/', authenticate, async (req, res) => {
  try {
    const {
      receiverId,
      projectName,
      projectDescription,
      lookingForInstrument,
      message
    } = req.body;
    const senderId = req.user._id || req.user.id;

    if (!receiverId || !projectName) {
      return res.status(400).json({ error: 'receiverId and projectName are required' });
    }

    if (senderId.toString() === receiverId.toString()) {
      return res.status(400).json({ error: 'Cannot send request to yourself' });
    }

    // Check for existing pending request
    const existing = await CollaborationRequest.findOne({
      senderId,
      receiverId,
      status: 'pending'
    });

    if (existing) {
      return res.status(400).json({ 
        error: 'You already have a pending request to this user' 
      });
    }

    const request = new CollaborationRequest({
      senderId,
      receiverId,
      projectName,
      projectDescription: projectDescription || '',
      lookingForInstrument: lookingForInstrument || '',
      message: message || ''
    });

    await request.save();

    res.status(201).json({ request });
  } catch (error) {
    console.error('Send request error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get received requests
router.get('/received', authenticate, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;
    const { status = 'pending' } = req.query;

    const requests = await CollaborationRequest.find({
      receiverId: userId,
      status
    })
      .populate('senderId', 'username profilePicture')
      .sort({ createdAt: -1 });

    res.json({ requests });
  } catch (error) {
    console.error('Get received requests error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Get sent requests
router.get('/sent', authenticate, async (req, res) => {
  try {
    const userId = req.user._id || req.user.id;

    const requests = await CollaborationRequest.find({
      senderId: userId
    })
      .populate('receiverId', 'username profilePicture')
      .sort({ createdAt: -1 });

    res.json({ requests });
  } catch (error) {
    console.error('Get sent requests error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Accept request
router.post('/:requestId/accept', authenticate, async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user._id || req.user.id;

    const request = await CollaborationRequest.findOne({
      _id: requestId,
      receiverId: userId,
      status: 'pending'
    });

    if (!request) {
      return res.status(404).json({ error: 'Request not found or already processed' });
    }

    // Update request status
    request.status = 'accepted';
    await request.save();

    // Create collaboration project
    const sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    
    const project = new CollaborationProject({
      name: request.projectName,
      description: request.projectDescription || '',
      requestId: request._id,
      sessionId,
      collaborators: [
        {
          userId: request.senderId,
          role: 'creator',
          permissions: 'admin'
        },
        {
          userId: request.receiverId,
          role: request.lookingForInstrument || 'collaborator',
          permissions: 'edit'
        }
      ],
      tracks: []
    });

    await project.save();

    res.json({ project, sessionId });
  } catch (error) {
    console.error('Accept request error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Reject request
router.post('/:requestId/reject', authenticate, async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user._id || req.user.id;

    const request = await CollaborationRequest.findOneAndUpdate(
      {
        _id: requestId,
        receiverId: userId,
        status: 'pending'
      },
      { status: 'rejected' },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ error: 'Request not found or already processed' });
    }

    res.json({ message: 'Request rejected' });
  } catch (error) {
    console.error('Reject request error:', error);
    res.status(500).json({ error: error.message });
  }
});

// Cancel sent request (optional)
router.post('/:requestId/cancel', authenticate, async (req, res) => {
  try {
    const { requestId } = req.params;
    const userId = req.user._id || req.user.id;

    const request = await CollaborationRequest.findOneAndUpdate(
      {
        _id: requestId,
        senderId: userId,
        status: 'pending'
      },
      { status: 'cancelled' },
      { new: true }
    );

    if (!request) {
      return res.status(404).json({ error: 'Request not found or already processed' });
    }

    res.json({ message: 'Request cancelled' });
  } catch (error) {
    console.error('Cancel request error:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;