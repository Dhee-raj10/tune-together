import React, { useState, useEffect } from 'react';
// FIX 1: Path corrected. It moves up one directory from 'studio' to 'components', then looks for TrackPlayer.
import { TrackPlayer } from '../TrackPlayer'; 
// FIX 2: Path corrected. It moves up two directories from 'studio' to 'components', to 'src', then goes to contexts/AuthContext.
import { useAuth } from '../../contexts/AuthContext'; 
// FIX 3: Path corrected. It moves up two directories, then goes to services/api.
import api from '../../services/api';
// FIX 4: Path corrected. It moves up two directories, then goes to hooks/use-toast.
import { toast } from '../../hooks/use-toast'; 

export const AISuggestionPanel = ({ projectId, onSuggestionAccepted }) => {
  const { user } = useAuth();
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentSuggestion, setCurrentSuggestion] = useState(null);
  const [instrument, setInstrument] = useState('');
  const [style, setStyle] = useState('');
  const [bars, setBars] = useState('4');
  const [textPrompt, setTextPrompt] = useState('');
  const [selectedGenerationMode, setSelectedGenerationMode] = useState('');
  const [isAccepting, setIsAccepting] = useState(false);
  const [isDiscarding, setIsDiscarding] = useState(false);

  const handleGenerateSuggestion = async () => {
    if (!user || isGenerating) return;
    setIsGenerating(true);
    setCurrentSuggestion(null);

    const generationData = {
      instrument,
      style,
      generation_mode: selectedGenerationMode,
      bars: parseInt(bars, 10),
      text_prompt: textPrompt,
      // NOTE: Project tempo/metadata should be included here for accurate AI generation
    };

    try {
      const res = await api.post('/ai/generate-track', generationData);
      setCurrentSuggestion(res.data);
      toast({ title: 'AI suggestion generated!', variant: 'success' });
    } catch (error) {
      console.error('Error generating AI suggestion:', error);
      toast({ title: 'Failed to generate AI suggestion.', variant: 'error' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAcceptSuggestion = async () => {
    if (!user || isAccepting) return;
    setIsAccepting(true);

    const trackData = {
      project_id: projectId,
      title: currentSuggestion.title,
      duration: currentSuggestion.duration,
      file_url: currentSuggestion.file_url,
    };

    try {
      // NOTE: The AI generated track needs to be saved as a regular track
      await api.post(`/projects/${projectId}/tracks`, trackData);
      toast({ title: 'AI track added to project!', variant: 'success' });
      onSuggestionAccepted();
      setCurrentSuggestion(null);
    } catch (error) {
      console.error('Error adding track to project:', error);
      toast({ title: 'Failed to add track to project.', variant: 'error' });
    } finally {
      setIsAccepting(false);
    }
  };

  const handleDiscardSuggestion = async () => {
    if (!currentSuggestion || isDiscarding) return;
    setIsDiscarding(true);

    try {
      // FIX: Assuming AI generated files are temporary and don't require an explicit API DELETE call 
      // since the mock server doesn't manage temp files efficiently.
      // If a dedicated API route existed: await api.delete(`/ai/suggestions/${currentSuggestion.id}`);
      
      toast({ title: 'Suggestion discarded.', variant: 'default' });
      setCurrentSuggestion(null);
    } catch (error) {
      console.error("Error discarding suggestion:", error);
      toast({ title: 'Failed to discard suggestion.', variant: 'error' });
    } finally {
      setIsDiscarding(false);
    }
  };

  return (
    <div className="card shadow-sm border-0 p-4">
      <h2 className="h4 fw-bold mb-3 d-flex align-items-center">
        <i className="bi bi-robot me-2 text-primary"></i> AI Music Suggestion
      </h2>

      {!currentSuggestion ? (
        <div className="space-y-3">
          <div className="form-group">
            <label htmlFor="generationMode" className="form-label">Generation Mode</label>
            <select
              id="generationMode"
              className="form-select"
              value={selectedGenerationMode}
              onChange={(e) => setSelectedGenerationMode(e.target.value)}
              disabled={isGenerating}
            >
              <option value="">Select a mode</option>
              <option value="text">Text-to-Music</option>
              <option value="instrument">Instrument-Style</option>
            </select>
          </div>

          {selectedGenerationMode === 'instrument' && (
            <div className="row g-3">
              <div className="col-md-6">
                <label htmlFor="instrumentSelect" className="form-label">Instrument</label>
                <select
                  id="instrumentSelect"
                  className="form-select"
                  value={instrument}
                  onChange={(e) => setInstrument(e.target.value)}
                  disabled={isGenerating}
                >
                  <option value="">Select an instrument</option>
                  <option value="drums">Drums</option>
                  <option value="piano">Piano</option>
                  <option value="guitar">Guitar</option>
                  <option value="bass">Bass</option>
                </select>
              </div>
              <div className="col-md-6">
                <label htmlFor="styleSelect" className="form-label">Style</label>
                <select
                  id="styleSelect"
                  className="form-select"
                  value={style}
                  onChange={(e) => setStyle(e.target.value)}
                  disabled={isGenerating}
                >
                  <option value="">Select a style</option>
                  <option value="jazzy">Jazzy</option>
                  <option value="lo-fi">Lo-fi</option>
                  <option value="rock">Rock</option>
                  <option value="acoustic">Acoustic</option>
                </select>
              </div>
            </div>
          )}

          {selectedGenerationMode === 'text' && (
            <div className="form-group">
              <label htmlFor="textPrompt" className="form-label">Text Prompt</label>
              <textarea
                id="textPrompt"
                className="form-control"
                placeholder="e.g., A funky bassline with a groovy beat"
                value={textPrompt}
                onChange={(e) => setTextPrompt(e.target.value)}
                rows="3"
                disabled={isGenerating}
              ></textarea>
            </div>
          )}

          <div className="form-group">
            <label htmlFor="bars" className="form-label">Bars</label>
            <select
              id="bars"
              className="form-select"
              value={bars}
              onChange={(e) => setBars(e.target.value)}
              disabled={isGenerating}
            >
              <option value="4">4 Bars</option>
              <option value="8">8 Bars</option>
              <option value="16">16 Bars</option>
            </select>
          </div>

          <button
            onClick={handleGenerateSuggestion}
            className="btn btn-primary w-100"
            disabled={
              isGenerating ||
              (selectedGenerationMode === 'instrument' && (!instrument || !style)) ||
              (selectedGenerationMode === 'text' && !textPrompt)
            }
          >
            {isGenerating ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                Generating...
              </>
            ) : (
              <>
                <i className="bi bi-magic me-2"></i> Generate Suggestion
              </>
            )}
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          <p className="fw-semibold">Generated Suggestion:</p>
          <TrackPlayer
            trackUrl={currentSuggestion.audioUrl}
            title={currentSuggestion.title}
            duration={currentSuggestion.duration}
          />

          <div className="d-flex gap-2">
            <button
              onClick={handleAcceptSuggestion}
              disabled={isAccepting || !user}
              className="btn btn-success flex-grow-1"
            >
              {isAccepting ? (
                <>
                  <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                  Adding...
                </>
              ) : (
                <>
                  <i className="bi bi-check-lg me-2"></i>✔️ Use in Project
                </>
              )}
            </button>
            <button
              onClick={handleDiscardSuggestion}
              className="btn btn-outline-danger flex-grow-1"
              disabled={isAccepting || !user}
            >
              <i className="bi bi-x-lg me-2"></i> ❌ Discard
            </button>
          </div>
          <button
            onClick={() => {
              setCurrentSuggestion(null);
              setInstrument('');
              setStyle('');
              setSelectedGenerationMode('');
              setBars('4');
              setTextPrompt('');
            }}
            className="btn btn-link w-100 mt-2"
            disabled={isGenerating || isAccepting}
          >
            Generate a different suggestion
          </button>
        </div>
      )}
    </div>
  );
};
