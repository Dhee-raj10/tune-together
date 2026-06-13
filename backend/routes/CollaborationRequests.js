// backend/routes/CollaborationRequests.js - COMPLETE REPLACEMENT
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const CollaborationRequest = require('../models/CollaborationRequest');
const CollaborationProject = require('../models/CollaborationProject');
const { v4: uuidv4 } = require('uuid');

const generateSessionId = () => `session-${uuidv4()}`;

// @route POST /api/collaboration/requests - Send collaboration request
router.post('/', auth, async (req, res) => {
    const { receiverId, projectName, projectDescription, lookingForInstrument, message } = req.body;

    if (req.user.id === receiverId) {
        return res.status(400).json({ msg: "Cannot send a collaboration request to yourself." });
    }

    try {
        // ✅ Check if request already exists
        const existingRequest = await CollaborationRequest.findOne({
            senderId: req.user.id,
            receiverId: receiverId,
            status: 'pending'
        });

        if (existingRequest) {
            return res.status(400).json({ msg: "You already have a pending request to this user." });
        }

        const newRequest = new CollaborationRequest({
            senderId: req.user.id,
            receiverId,
            projectName,
            projectDescription,
            lookingForInstrument,
            message,
            status: 'pending'
        });

        await newRequest.save();
        
        console.log('✅ Collaboration request created:', newRequest._id);
        
        res.status(201).json({ 
            msg: 'Collaboration request sent successfully.', 
            request: newRequest 
        });

    } catch (err) {
        console.error('❌ Error sending collaboration request:', err.message);
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
});

// @route GET /api/collaboration/requests/received - Get received requests
router.get('/received', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        
        console.log('📥 Fetching requests for user:', userId);
        
        const requests = await CollaborationRequest.find({
            receiverId: userId,
            status: 'pending'
        })
        .populate('senderId', 'username avatar_url email')
        .sort({ createdAt: -1 });

        console.log(`✅ Found ${requests.length} pending requests`);

        res.json(requests);
    } catch (err) {
        console.error('❌ Error fetching requests:', err.message);
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
});

// @route GET /api/collaboration/requests/sent - Get sent requests
router.get('/sent', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        
        const requests = await CollaborationRequest.find({
            senderId: userId
        })
        .populate('receiverId', 'username avatar_url email')
        .sort({ createdAt: -1 });

        console.log(`✅ Found ${requests.length} sent requests`);

        res.json(requests);
    } catch (err) {
        console.error('❌ Error fetching sent requests:', err.message);
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
});

// @route PUT /api/collaboration/requests/:id/accept - Accept request
router.put('/:id/accept', auth, async (req, res) => {
    try {
        const request = await CollaborationRequest.findById(req.params.id)
            .populate('senderId', 'username')
            .populate('receiverId', 'username');

        if (!request) {
            return res.status(404).json({ msg: 'Request not found.' });
        }

        if (request.receiverId._id.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Unauthorized action.' });
        }

        if (request.status !== 'pending') {
            return res.status(400).json({ msg: 'Request already processed.' });
        }

        console.log('✅ Accepting collaboration request:', request._id);

        // ✅ STEP 1: Update request status
        request.status = 'accepted';
        await request.save();

        // ✅ STEP 2: Create collaborative project
        const newCollabProject = new CollaborationProject({
            name: request.projectName || 'Collaborative Project',
            description: request.projectDescription || '',
            requestId: request._id,
            sessionId: generateSessionId(),
            collaborators: [
                { 
                    userId: request.receiverId._id, 
                    role: 'creator', 
                    permissions: 'admin' 
                },
                { 
                    userId: request.senderId._id, 
                    role: 'collaborator', 
                    permissions: 'edit' 
                }
            ],
            bpm: 120,
            tracks: [],
            status: 'active'
        });

        await newCollabProject.save();

        console.log('✅ Collaborative project created:', newCollabProject._id);

        res.json({
            msg: 'Collaboration accepted! Project created successfully.',
            projectId: newCollabProject._id,
            projectName: newCollabProject.name,
            sessionId: newCollabProject.sessionId
        });

    } catch (err) {
        console.error('❌ Error accepting collaboration request:', err.message);
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
});

// @route PUT /api/collaboration/requests/:id/reject - Reject request
router.put('/:id/reject', auth, async (req, res) => {
    try {
        const request = await CollaborationRequest.findById(req.params.id);
        
        if (!request) {
            return res.status(404).json({ msg: 'Request not found.' });
        }
        
        if (request.receiverId.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Unauthorized action.' });
        }
        
        if (request.status !== 'pending') {
            return res.status(400).json({ msg: 'Request already processed.' });
        }

        console.log('❌ Rejecting collaboration request:', request._id);

        request.status = 'rejected';
        await request.save();

        res.json({ msg: 'Request rejected successfully.' });

    } catch (err) {
        console.error('❌ Error rejecting collaboration request:', err.message);
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
});

// @route DELETE /api/collaboration/requests/:id - Cancel/delete request
router.delete('/:id', auth, async (req, res) => {
    try {
        const request = await CollaborationRequest.findById(req.params.id);
        
        if (!request) {
            return res.status(404).json({ msg: 'Request not found.' });
        }
        
        // Only sender can cancel
        if (request.senderId.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Only the sender can cancel this request.' });
        }

        await request.deleteOne();

        console.log('🗑️ Request deleted:', request._id);

        res.json({ msg: 'Request cancelled successfully.' });

    } catch (err) {
        console.error('❌ Error deleting request:', err.message);
        res.status(500).json({ msg: 'Server error', error: err.message });
    }
});

module.exports = router;