import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useStudio } from '../../contexts/StudioContext';
import api from '../../services/api';
import { toast } from '../../hooks/use-toast';
import { AudioMixer } from '../../utils/audioMixer';

export const AISuggestionPanel = ({ projectId, onSuggestionAccepted }) => {
  const { user } = useAuth();
  const { tracks } = useStudio(); // Get existing tracks
  const audioRef = useRef(null);
  const audioContextRef = useRef(null);
  
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentSuggestion, setCurrentSuggestion] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isAccepting, setIsAccepting] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [selectedTrackForMix, setSelectedTrackForMix] = useState(null);
  
  // Form state
  const [generationMode, setGenerationMode] = useState('text');
  const [textPrompt, setTextPrompt] = useState('');
  const [instrument, setInstrument] = useState('');
  const [style, setStyle] = useState('');
  const [duration, setDuration] = useState('8');

  // Initialize Audio Context
  useEffect(() => {
    audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    return () => {
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
    };
  }, []);

  // Generate audio using Web Audio API
  const generateAudioFromMetadata = (metadata) => {
    const audioContext = audioContextRef.current;
    const sampleRate = audioContext.sampleRate;
    const durationSec = metadata.duration;
    const numSamples = sampleRate * durationSec;
    
    const audioBuffer = audioContext.createBuffer(2, numSamples, sampleRate);
    const leftChannel = audioBuffer.getChannelData(0);
    const rightChannel = audioBuffer.getChannelData(1);
    
    const frequencies = metadata.frequencies || [440, 493.88, 523.25];
    const tempo = metadata.tempo || 120;
    const beatDuration = 60 / tempo;
    
    for (let i = 0; i < numSamples; i++) {
      const time = i / sampleRate;
      const beatIndex = Math.floor(time / beatDuration);
      const freqIndex = beatIndex % frequencies.length;
      const frequency = frequencies[freqIndex];
      
      const fundamental = Math.sin(2 * Math.PI * frequency * time);
      const harmonic2 = Math.sin(2 * Math.PI * frequency * 2 * time) * 0.3;
      const harmonic3 = Math.sin(2 * Math.PI * frequency * 3 * time) * 0.15;
      
      const noteTime = time % beatDuration;
      let envelope = 1;
      const attack = 0.05;
      const decay = 0.1;
      const sustain = 0.7;
      const release = 0.2;
      
      if (noteTime < attack) {
        envelope = noteTime / attack;
      } else if (noteTime < attack + decay) {
        envelope = 1 - (1 - sustain) * (noteTime - attack) / decay;
      } else if (noteTime < beatDuration - release) {
        envelope = sustain;
      } else {
        envelope = sustain * (beatDuration - noteTime) / release;
      }
      
      const sample = (fundamental + harmonic2 + harmonic3) * envelope * 0.3;
      leftChannel[i] = sample;
      rightChannel[i] = sample;
    }
    
    return audioBuffer;
  };

  const audioBufferToWav = (audioBuffer) => {
    const numChannels = audioBuffer.numberOfChannels;
    const sampleRate = audioBuffer.sampleRate;
    const format = 1;
    const bitDepth = 16;
    
    const bytesPerSample = bitDepth / 8;
    const blockAlign = numChannels * bytesPerSample;
    
    const data = [];
    for (let i = 0; i < audioBuffer.length; i++) {
      for (let channel = 0; channel < numChannels; channel++) {
        const sample = audioBuffer.getChannelData(channel)[i];
        const intSample = Math.max(-1, Math.min(1, sample));
        data.push(intSample < 0 ? intSample * 0x8000 : intSample * 0x7FFF);
      }
    }
    
    const dataLength = data.length * bytesPerSample;
    const buffer = new ArrayBuffer(44 + dataLength);
    const view = new DataView(buffer);
    
    const writeString = (offset, string) => {
      for (let i = 0; i < string.length; i++) {
        view.setUint8(offset + i, string.charCodeAt(i));
      }
    };
    
    writeString(0, 'RIFF');
    view.setUint32(4, 36 + dataLength, true);
    writeString(8, 'WAVE');
    writeString(12, 'fmt ');
    view.setUint32(16, 16, true);
    view.setUint16(20, format, true);
    view.setUint16(22, numChannels, true);
    view.setUint32(24, sampleRate, true);
    view.setUint32(28, sampleRate * blockAlign, true);
    view.setUint16(32, blockAlign, true);
    view.setUint16(34, bitDepth, true);
    writeString(36, 'data');
    view.setUint32(40, dataLength, true);
    
    let offset = 44;
    for (let i = 0; i < data.length; i++) {
      view.setInt16(offset, data[i], true);
      offset += 2;
    }
    
    return new Blob([buffer], { type: 'audio/wav' });
  };

  const handleGenerateSuggestion = async () => {
    if (!user || isGenerating) return;

    if (generationMode === 'text' && !textPrompt.trim()) {
      toast({ title: 'Error', description: 'Please enter a text prompt', variant: 'error' });
      return;
    }

    if (generationMode === 'instrument' && (!instrument || !style)) {
      toast({ title: 'Error', description: 'Please select instrument and style', variant: 'error' });
      return;
    }

    setIsGenerating(true);
    setCurrentSuggestion(null);
    setAudioBlob(null);

    const generationData = {
      generation_mode: generationMode,
      text_prompt: generationMode === 'text' ? textPrompt : '',
      instrument: generationMode === 'instrument' ? instrument : '',
      style: generationMode === 'instrument' ? style : '',
      duration: parseInt(duration, 10),
      project_id: projectId
    };

    try {
      const res = await api.post('/ai/generate-track', generationData);
      
      if (res.data.audioMetadata) {
        const audioBuffer = generateAudioFromMetadata(res.data.audioMetadata);
        const wavBlob = audioBufferToWav(audioBuffer);
        const audioUrl = URL.createObjectURL(wavBlob);
        
        setAudioBlob(wavBlob);
        setCurrentSuggestion({
          ...res.data,
          audioUrl: audioUrl,
          file_url: audioUrl
        });
        
        toast({ title: 'Success', description: 'AI track generated successfully!', variant: 'success' });
      } else {
        setCurrentSuggestion(res.data);
        toast({ title: 'Success', description: 'AI track generated successfully!', variant: 'success' });
      }
    } catch (error) {
      console.error('Error generating AI suggestion:', error);
      toast({ 
        title: 'Error', 
        description: error.response?.data?.msg || 'Failed to generate AI suggestion', 
        variant: 'error' 
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const togglePlayback = () => {
    if (!currentSuggestion?.audioUrl) return;

    if (isPlaying && audioRef.current) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else if (audioRef.current) {
      audioRef.current.play();
      setIsPlaying(true);
    }
  };

  const handleMixWithTrack = async () => {
    if (!selectedTrackForMix) {
      toast({ title: 'Error', description: 'Please select a track to mix with', variant: 'error' });
      return;
    }

    if (!audioBlob) {
      toast({ title: 'Error', description: 'No AI track to mix', variant: 'error' });
      return;
    }

    setIsAccepting(true);

    try {
      const mixer = new AudioMixer();
      
      // Get the selected track URL
      const selectedTrack = tracks.find(t => (t.id || t._id) === selectedTrackForMix);
      const originalTrackUrl = `http://localhost:5000${selectedTrack.file_url}`;
      const aiTrackUrl = currentSuggestion.audioUrl;
      
      console.log('Mixing tracks:', originalTrackUrl, 'with AI track');
      
      // Mix the tracks
      const mixedBlob = await mixer.mixAudioFiles([
        { url: originalTrackUrl, volume: 0.7 },  // Original track at 70%
        { url: aiTrackUrl, volume: 0.5 }         // AI track at 50%
      ]);
      
      // Upload the mixed track
      const formData = new FormData();
      formData.append('track', mixedBlob, `${selectedTrack.title}-with-AI.wav`);
      formData.append('title', `${selectedTrack.title} + AI (${currentSuggestion.title})`);
      formData.append('duration', selectedTrack.duration);

      const response = await api.post(`/projects/${projectId}/tracks`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast({ 
        title: 'Success', 
        description: 'AI track mixed with original and added to project!', 
        variant: 'success' 
      });
      
      if (onSuggestionAccepted) {
        onSuggestionAccepted(response.data);
      }
      
      // Reset
      setCurrentSuggestion(null);
      setIsPlaying(false);
      setAudioBlob(null);
      setSelectedTrackForMix(null);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
      
      mixer.destroy();
      
    } catch (error) {
      console.error('Error mixing tracks:', error);
      toast({ 
        title: 'Error', 
        description: error.message || 'Failed to mix tracks', 
        variant: 'error' 
      });
    } finally {
      setIsAccepting(false);
    }
  };

  const handleAddAsNewTrack = async () => {
    if (!audioBlob) return;
    setIsAccepting(true);

    try {
      const formData = new FormData();
      formData.append('track', audioBlob, `${currentSuggestion.title}.wav`);
      formData.append('title', currentSuggestion.title || 'AI Generated Track');
      formData.append('duration', currentSuggestion.duration || duration);

      const response = await api.post(`/projects/${projectId}/tracks`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      toast({ title: 'Success', description: 'AI track added as new track!', variant: 'success' });
      
      if (onSuggestionAccepted) {
        onSuggestionAccepted(response.data);
      }
      
      setCurrentSuggestion(null);
      setIsPlaying(false);
      setAudioBlob(null);
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current.currentTime = 0;
      }
    } catch (error) {
      console.error('Error adding track:', error);
      toast({ 
        title: 'Error', 
        description: error.response?.data?.msg || 'Failed to add track', 
        variant: 'error' 
      });
    } finally {
      setIsAccepting(false);
    }
  };

  const handleDiscardSuggestion = () => {
    if (currentSuggestion?.audioUrl) {
      URL.revokeObjectURL(currentSuggestion.audioUrl);
    }
    setCurrentSuggestion(null);
    setIsPlaying(false);
    setAudioBlob(null);
    setSelectedTrackForMix(null);
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current.currentTime = 0;
    }
    toast({ title: 'Discarded', description: 'AI suggestion discarded', variant: 'default' });
  };

  const handleAudioEnded = () => {
    setIsPlaying(false);
  };

  return (
    <div className="card shadow-sm border-0 p-4">
      <h2 className="h5 fw-bold mb-3 d-flex align-items-center">
        <i className="bi bi-stars me-2 text-primary"></i> AI Music Assistant
      </h2>

      {!currentSuggestion ? (
        <div className="space-y-3">
          <div className="mb-3">
            <label className="form-label fw-semibold">Generation Mode</label>
            <div className="btn-group w-100" role="group">
              <input
                type="radio"
                className="btn-check"
                name="genMode"
                id="modeText"
                checked={generationMode === 'text'}
                onChange={() => setGenerationMode('text')}
              />
              <label className="btn btn-outline-primary" htmlFor="modeText">
                <i className="bi bi-chat-text me-1"></i> Text-to-Music
              </label>

              <input
                type="radio"
                className="btn-check"
                name="genMode"
                id="modeInstrument"
                checked={generationMode === 'instrument'}
                onChange={() => setGenerationMode('instrument')}
              />
              <label className="btn btn-outline-primary" htmlFor="modeInstrument">
                <i className="bi bi-music-note-beamed me-1"></i> Instrument
              </label>
            </div>
          </div>

          {generationMode === 'text' && (
            <div className="mb-3">
              <label htmlFor="textPrompt" className="form-label fw-semibold">
                Describe your music
              </label>
              <textarea
                id="textPrompt"
                className="form-control"
                placeholder="e.g., Upbeat jazz piano with smooth saxophone melody"
                value={textPrompt}
                onChange={(e) => setTextPrompt(e.target.value)}
                rows="3"
                disabled={isGenerating}
              ></textarea>
            </div>
          )}

          {generationMode === 'instrument' && (
            <>
              <div className="mb-3">
                <label htmlFor="instrument" className="form-label fw-semibold">Instrument</label>
                <select
                  id="instrument"
                  className="form-select"
                  value={instrument}
                  onChange={(e) => setInstrument(e.target.value)}
                  disabled={isGenerating}
                >
                  <option value="">Select instrument</option>
                  <option value="piano">🎹 Piano</option>
                  <option value="guitar">🎸 Guitar</option>
                  <option value="drums">🥁 Drums</option>
                  <option value="bass">🎸 Bass</option>
                  <option value="synth">🎛️ Synthesizer</option>
                  <option value="strings">🎻 Strings</option>
                  <option value="saxophone">🎷 Saxophone</option>
                </select>
              </div>

              <div className="mb-3">
                <label htmlFor="style" className="form-label fw-semibold">Musical Style</label>
                <select
                  id="style"
                  className="form-select"
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  disabled={isGenerating}
                >
                  <option value="">Select style</option>
                  <option value="jazz">Jazz</option>
                  <option value="rock">Rock</option>
                  <option value="pop">Pop</option>
                  <option value="classical">Classical</option>
                  <option value="electronic">Electronic</option>
                  <option value="hip-hop">Hip-Hop</option>
                  <option value="blues">Blues</option>
                  <option value="ambient">Ambient</option>
                  <option value="lo-fi">Lo-fi</option>
                </select>
              </div>
            </>
          )}

          <div className="mb-3">
            <label htmlFor="duration" className="form-label fw-semibold">Duration</label>
            <select
              id="duration"
              className="form-select"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              disabled={isGenerating}
            >
              <option value="4">4 seconds</option>
              <option value="8">8 seconds</option>
              <option value="16">16 seconds</option>
              <option value="32">32 seconds</option>
            </select>
          </div>

          <button
            onClick={handleGenerateSuggestion}
            className="btn btn-primary w-100"
            disabled={isGenerating}
          >
            {isGenerating ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Generating AI Music...
              </>
            ) : (
              <>
                <i className="bi bi-stars me-2"></i> Generate Track
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="alert alert-success mb-3">
            <i className="bi bi-check-circle me-2"></i>
            <strong>Track Generated!</strong>
          </div>

          <div className="card bg-light border-0 p-3 mb-3">
            <div className="d-flex align-items-center justify-content-between mb-2">
              <div>
                <h6 className="mb-1 fw-bold">{currentSuggestion.title || 'AI Generated Track'}</h6>
                <small className="text-muted">
                  Duration: {currentSuggestion.duration || duration}s
                </small>
              </div>
              <button
                onClick={togglePlayback}
                className={`btn ${isPlaying ? 'btn-danger' : 'btn-success'} btn-sm`}
              >
                {isPlaying ? (
                  <>
                    <i className="bi bi-pause-fill"></i> Pause
                  </>
                ) : (
                  <>
                    <i className="bi bi-play-fill"></i> Play
                  </>
                )}
              </button>
            </div>

            {currentSuggestion.audioUrl && (
              <audio
                ref={audioRef}
                src={currentSuggestion.audioUrl}
                onEnded={handleAudioEnded}
                className="w-100"
                controls
              />
            )}
          </div>

          {/* Mix with existing track */}
          {tracks.length > 0 && (
            <div className="card border-primary p-3 mb-3">
              <h6 className="mb-2">
                <i className="bi bi-shuffle me-2"></i>Mix with Existing Track
              </h6>
              <select
                className="form-select mb-2"
                value={selectedTrackForMix || ''}
                onChange={(e) => setSelectedTrackForMix(e.target.value)}
              >
                <option value="">Select a track to mix with...</option>
                {tracks.map(track => (
                  <option key={track.id || track._id} value={track.id || track._id}>
                    {track.title}
                  </option>
                ))}
              </select>
              <button
                onClick={handleMixWithTrack}
                disabled={isAccepting || !selectedTrackForMix}
                className="btn btn-primary w-100"
              >
                {isAccepting ? (
                  <>
                    <span className="spinner-border spinner-border-sm me-2"></span>
                    Mixing & Uploading...
                  </>
                ) : (
                  <>
                    <i className="bi bi-shuffle me-2"></i>Mix & Add to Project
                  </>
                )}
              </button>
              <small className="text-muted mt-2 d-block">
                <i className="bi bi-info-circle me-1"></i>
                This will combine the AI track with your selected track into one audio file
              </small>
            </div>
          )}

          {/* Or add as separate track */}
          <div className="d-flex gap-2">
            <button
              onClick={handleAddAsNewTrack}
              disabled={isAccepting}
              className="btn btn-outline-success flex-grow-1"
            >
              {isAccepting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2"></span>
                  Adding...
                </>
              ) : (
                <>
                  <i className="bi bi-plus-lg me-2"></i>Add as New Track
                </>
              )}
            </button>

            <button
              onClick={handleDiscardSuggestion}
              className="btn btn-outline-danger flex-grow-1"
              disabled={isAccepting}
            >
              <i className="bi bi-x-lg me-2"></i>Discard
            </button>
          </div>

          <button
            onClick={() => {
              handleDiscardSuggestion();
            }}
            className="btn btn-link w-100 text-decoration-none small"
          >
            <i className="bi bi-arrow-counterclockwise me-1"></i>
            Generate a different track
          </button>
        </div>
      )}
    </div>
  );
};