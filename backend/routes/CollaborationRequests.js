// routes/CollaborationRequests.js
const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');
const CollaborationRequest = require('../models/CollaborationRequest');
const CollaborationProject = require('../models/CollaborationProject');
const { v4: uuidv4 } = require('uuid');

const generateSessionId = () => `session-${uuidv4()}`;

// @route POST /api/collaboration/requests (SECURED) - Send Request
router.post('/', auth, async (req, res) => {
    const { receiverId, projectName, projectDescription, lookingForInstrument, message } = req.body;

    if (req.user.id === receiverId) {
        return res.status(400).json({ msg: "Cannot send a collaboration request to yourself." });
    }

    try {
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
        res.status(201).json({ msg: 'Collaboration request sent successfully.', request: newRequest });

    } catch (err) {
        console.error('Error sending collaboration request:', err.message);
        res.status(500).send('Server error');
    }
});

// @route GET /api/collaboration/requests/received (SECURED)
router.get('/received', auth, async (req, res) => {
    try {
        const userId = req.user.id;
        const requests = await CollaborationRequest.find({
            receiverId: userId,
            status: 'pending'
        })
        .populate('senderId', 'username avatar_url')
        .sort({ createdAt: -1 });

        res.json(requests);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server error');
    }
});


// @route PUT /api/collaboration/requests/:id/accept (SECURED) - Accept Request
router.put('/:id/accept', auth, async (req, res) => {
    try {
        const request = await CollaborationRequest.findById(req.params.id)
            .populate('senderId', 'username')
            .populate('receiverId', 'username');

        if (!request) return res.status(404).json({ msg: 'Request not found.' });
        if (request.receiverId._id.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Unauthorized action.' });
        }
        if (request.status !== 'pending') {
            return res.status(400).json({ msg: 'Request already processed.' });
        }

        // 1. Update request status
        request.status = 'accepted';
        await request.save();

        // 2. Create a new CollaborationProject
        const newCollabProject = new CollaborationProject({
            name: request.projectName || 'New Collaborative Project',
            description: request.projectDescription,
            requestId: request._id,
            sessionId: generateSessionId(),
            collaborators: [
                { userId: request.receiverId._id, role: 'creator', permissions: 'admin' }, 
                { userId: request.senderId._id, role: 'collaborator', permissions: 'edit' }  
            ],
            bpm: 120,
        });

        await newCollabProject.save();

        // 3. Respond with the new project details for redirection
        res.json({
            msg: 'Collaboration accepted and project created successfully.',
            projectId: newCollabProject._id,
            projectName: newCollabProject.name
        });

    } catch (err) {
        console.error('Error accepting collaboration request:', err.message);
        res.status(500).send('Server error');
    }
});

// @route PUT /api/collaboration/requests/:id/reject (SECURED) - Reject Request
router.put('/:id/reject', auth, async (req, res) => {
    try {
        const request = await CollaborationRequest.findById(req.params.id);
        if (!request) return res.status(404).json({ msg: 'Request not found.' });
        
        // Ensure only the intended receiver can reject the request
        if (request.receiverId.toString() !== req.user.id) {
            return res.status(403).json({ msg: 'Unauthorized action.' });
        }
        
        if (request.status !== 'pending') {
            return res.status(400).json({ msg: 'Request already processed.' });
        }

        request.status = 'rejected';
        await request.save();

        res.json({ msg: 'Request rejected successfully.' });

    } catch (err) {
        console.error('Error rejecting collaboration request:', err.message);
        res.status(500).send('Server error');
    }
});

module.exports = router;