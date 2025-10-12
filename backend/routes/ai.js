const express = require('express');
const router = express.Router();
const auth = require('../middleware/auth');

// Simple in-memory storage for generated tracks
const generatedTracks = new Map();

// @route POST /api/ai/generate-track
// @desc Generate AI music track - Returns data URL for audio
// @access Private
router.post('/generate-track', auth, async (req, res) => {
  try {
    const { 
      generation_mode, 
      text_prompt, 
      instrument, 
      style, 
      duration
    } = req.body;

    console.log('AI Generation Request:', { generation_mode, text_prompt, instrument, style, duration });

    // Validate
    if (!generation_mode || !duration) {
      return res.status(400).json({ msg: 'Missing required fields' });
    }

    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Generate title
    let title = '';
    if (generation_mode === 'text') {
      title = text_prompt ? `AI: ${text_prompt.substring(0, 30)}` : 'AI Generated';
    } else {
      title = `AI: ${instrument || 'Instrument'} (${style || 'Style'})`;
    }

    // Generate unique ID
    const trackId = `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    // Map instruments to frequencies (notes)
    const instrumentFrequencies = {
      'piano': [261.63, 293.66, 329.63, 349.23, 392.00], // C, D, E, F, G
      'guitar': [329.63, 349.23, 392.00, 440.00, 493.88], // E, F, G, A, B
      'drums': [100, 150, 200, 250], // Bass frequencies
      'bass': [82.41, 110.00, 130.81, 146.83], // E, A, C, D (bass notes)
      'synth': [440.00, 493.88, 523.25, 587.33], // A, B, C, D
      'strings': [196.00, 246.94, 293.66, 329.63], // G, B, D, E
      'saxophone': [293.66, 329.63, 349.23, 392.00] // D, E, F, G
    };

    // Create metadata for frontend to generate audio
    const audioMetadata = {
      instrument: instrument || 'synth',
      style: style || 'ambient',
      duration: parseInt(duration, 10),
      frequencies: instrumentFrequencies[instrument] || instrumentFrequencies['synth'],
      tempo: 120,
      // Signal to frontend to generate audio using Web Audio API
      generateAudio: true
    };

    const response = {
      id: trackId,
      title: title,
      duration: parseInt(duration, 10),
      audioMetadata: audioMetadata, // Frontend will use this to generate audio
      generation_mode,
      metadata: {
        text_prompt: text_prompt || null,
        instrument: instrument || null,
        style: style || null,
        generated_at: new Date().toISOString(),
        provider: 'web-audio-api'
      }
    };

    // Store in memory
    generatedTracks.set(trackId, response);

    console.log('AI track generated:', trackId);
    res.json(response);

  } catch (error) {
    console.error('AI Generation Error:', error);
    res.status(500).json({ 
      msg: 'Error generating AI track',
      error: error.message 
    });
  }
});

// @route GET /api/ai/track/:id
// @desc Get a generated track by ID
// @access Public
router.get('/track/:id', (req, res) => {
  const track = generatedTracks.get(req.params.id);
  
  if (!track) {
    return res.status(404).json({ msg: 'Track not found' });
  }
  
  res.json(track);
});

module.exports = router;