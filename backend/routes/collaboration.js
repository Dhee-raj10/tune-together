const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); // Correct path
const CollaborationRequest = require('../models/CollaborationRequest');
const Project = require('../models/Project');

// @route GET /api/collaboration/requests (SECURED)
router.get('/requests', auth, async (req, res) => {
  try {
    const requests = await CollaborationRequest.find({
      to_user_id: req.user.id,
      status: 'pending'
    })
    .populate('project_id', 'title') 
    .populate('from_user_id', 'username avatar_url full_name') 
    .sort({ created_at: -1 });
    
    res.json(requests);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route PUT /api/collaboration/requests/:id (SECURED)
router.put('/requests/:id', auth, async (req, res) => {
  const { status } = req.body;
  
  if (!['accepted', 'rejected'].includes(status)) {
    return res.status(400).json({ msg: 'Invalid status provided.' });
  }

  try {
    const request = await CollaborationRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ msg: 'Request not found.' });
    if (request.to_user_id.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Unauthorized action.' });
    }

    // 1. Update request status
    request.status = status;
    await request.save();

    // 2. If accepted, add the sender to the project's collaborators array
    if (status === 'accepted') {
      await Project.findByIdAndUpdate(
        request.project_id,
        { $addToSet: { collaborators: request.from_user_id } },
        { new: true }
      );
    }

    res.json({ msg: `Request ${status} successfully.` });

  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route POST /api/collaboration/requests (SECURED)
router.post('/requests', auth, async (req, res) => {
    const { project_id, to_user_id, message } = req.body;
    
    if (req.user.id === to_user_id) {
        return res.status(400).json({ msg: "Cannot send a collaboration request to yourself." });
    }

    try {
        const newRequest = new CollaborationRequest({
            project_id,
            from_user_id: req.user.id,
            to_user_id,
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

module.exports = router;