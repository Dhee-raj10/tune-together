const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth'); 
// REMOVED: const { toast } = require('../frontend/hooks/use-toast'); 
// The backend should not import frontend utilities.

// @route POST /api/ai/generate-track (SECURED)
router.post('/generate-track', auth, async (req, res) => {
  const { instrument, style, generation_mode, bars, text_prompt } = req.body;
  const userId = req.user.id;
  
  // NOTE: This is a MOCK implementation. 
  
  console.log(`AI Request from User ${userId}: Mode=${generation_mode}, Prompt=${text_prompt || instrument}`);

  try {
    // 1. Simulate AI Audio Generation
    const tempo = req.body.tempo || 120; // Assume tempo is passed or default
    const mockDuration = (parseInt(bars, 10) * 4 * 60) / tempo; 
    const mockFileUrl = `/uploads/ai_generated_${Date.now()}.mp3`; 
    const mockTitle = `AI ${instrument || generation_mode} ${bars} Bars`;
    
    // Simulate latency
    await new Promise(resolve => setTimeout(resolve, 2500)); 
    
    // 2. Return the necessary data. The frontend handles the toast message.
    res.json({
      title: mockTitle,
      duration: mockDuration,
      file_url: mockFileUrl,
      audioUrl: mockFileUrl, 
      id: `ai-${Date.now()}`
    });

  } catch (err) {
    console.error('AI Generation Error (Internal):', err.message);
    // Send a 500 status so the frontend can display an error toast.
    res.status(500).json({ msg: 'AI generation service failed.' });
  }
});

module.exports = router;