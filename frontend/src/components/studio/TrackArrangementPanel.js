import React, { useState, useRef, useEffect } from 'react';
import { useStudio } from "../../contexts/StudioContext";
import { TrackUploader } from "../TrackUploader";

export const TrackArrangementPanel = () => {
  const { tracks, projectId, addTrack } = useStudio();
  const [playingTrackId, setPlayingTrackId] = useState(null);
  const audioRefs = useRef({});

  const handleUploadComplete = (newTrack) => {
    console.log('Track uploaded in TrackArrangementPanel:', newTrack);
    if (addTrack) {
      addTrack(newTrack);
    }
  };

  const handlePlayTrack = (trackId) => {
    // Pause all other tracks
    Object.keys(audioRefs.current).forEach(id => {
      if (id !== trackId && audioRefs.current[id]) {
        audioRefs.current[id].pause();
      }
    });

    const audioElement = audioRefs.current[trackId];
    if (!audioElement) return;

    if (playingTrackId === trackId) {
      // Pause if already playing
      audioElement.pause();
      setPlayingTrackId(null);
    } else {
      // Play this track
      audioElement.play();
      setPlayingTrackId(trackId);
    }
  };

  const handleAudioEnded = (trackId) => {
    if (playingTrackId === trackId) {
      setPlayingTrackId(null);
    }
  };

  const handleAudioPause = (trackId) => {
    if (playingTrackId === trackId) {
      setPlayingTrackId(null);
    }
  };

  return (
    <div className="h-full flex flex-col space-y-4">
      {/* Header */}
      <div className="d-flex justify-content-between align-items-center">
        <h3 className="text-lg font-semibold mb-0">Project Tracks</h3>
        <span className="text-sm text-gray-500">
          {tracks.length} track{tracks.length !== 1 ? 's' : ''}
        </span>
      </div>

      {/* Track Upload Section */}
      <div className="bg-gray-50 rounded-lg p-4 border-2 border-dashed border-gray-300">
        <h4 className="text-md font-medium mb-3 flex items-center">
          <svg className="w-5 h-5 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
          Upload New Track
        </h4>
        <TrackUploader 
          projectId={projectId} 
          onUploadComplete={handleUploadComplete} 
        />
      </div>

      {/* Tracks Display */}
      <div className="flex-1 overflow-y-auto">
        {tracks.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <svg className="mx-auto h-12 w-12 text-gray-400 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19V6l12-3v13M9 19c0 1.105-.895 2-2 2s-2-.895-2-2 .895-2 2-2 2 .895 2 2zm12-3c0 1.105-.895 2-2 2s-2-.895-2-2 .895-2 2-2 2 .895 2 2zM9 10l12-3" />
            </svg>
            <h4 className="text-lg font-medium text-gray-900 mb-2">No tracks yet</h4>
            <p className="text-gray-600">Upload audio files above to get started with your project.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {tracks.map((track, index) => {
              const trackId = track.id || track._id;
              const isPlaying = playingTrackId === trackId;
              const audioUrl = `https://tune-together.onrender.com${track.file_url}`;

              return (
                <div key={trackId || index} className="card border p-3">
                  {/* Track Header */}
                  <div className="d-flex align-items-start justify-content-between mb-3">
                    <div className="d-flex align-items-center gap-3 flex-grow-1">
                      {/* Play Button */}
                      <button
                        onClick={() => handlePlayTrack(trackId)}
                        className={`btn ${isPlaying ? 'btn-danger' : 'btn-success'} btn-lg`}
                        style={{ width: '50px', height: '50px', borderRadius: '50%' }}
                      >
                        <i className={`bi ${isPlaying ? 'bi-pause-fill' : 'bi-play-fill'} fs-5`}></i>
                      </button>

                      {/* Track Info */}
                      <div className="flex-grow-1">
                        <h4 className="text-md font-medium text-gray-900 mb-1">{track.title}</h4>
                        <div className="d-flex align-items-center gap-3">
                          <small className="text-muted">
                            <i className="bi bi-clock me-1"></i>
                            {Math.round(track.duration || 0)}s
                          </small>
                          {track.title.includes('AI') && (
                            <span className="badge bg-primary">
                              <i className="bi bi-stars me-1"></i>AI Generated
                            </span>
                          )}
                          {track.title.includes('+') && (
                            <span className="badge bg-success">
                              <i className="bi bi-shuffle me-1"></i>Mixed
                            </span>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Delete Button */}
                    <button
                      className="btn btn-outline-danger btn-sm"
                      onClick={() => {
                        if (window.confirm(`Delete "${track.title}"?`)) {
                          console.log('Delete track:', trackId);
                          // TODO: Implement delete functionality
                        }
                      }}
                    >
                      <i className="bi bi-trash"></i>
                    </button>
                  </div>

                  {/* Audio Element (Hidden) */}
                  <audio
                    ref={(el) => {
                      if (el) audioRefs.current[trackId] = el;
                    }}
                    src={audioUrl}
                    onEnded={() => handleAudioEnded(trackId)}
                    onPause={() => handleAudioPause(trackId)}
                    preload="metadata"
                    style={{ display: 'none' }}
                  />

                  {/* Waveform Visualization (Visual Only) */}
                  <div className="position-relative mb-2" style={{ height: '60px', background: '#f0f0f0', borderRadius: '8px', overflow: 'hidden' }}>
                    {/* Simple waveform simulation */}
                    <div className="d-flex align-items-center h-100 px-2">
                      {[...Array(50)].map((_, i) => {
                        const height = Math.random() * 40 + 10;
                        return (
                          <div
                            key={i}
                            style={{
                              width: '2%',
                              height: `${height}px`,
                              background: isPlaying ? '#0d6efd' : '#6c757d',
                              margin: '0 1px',
                              borderRadius: '2px',
                              transition: 'background 0.3s'
                            }}
                          />
                        );
                      })}
                    </div>
                    
                    {/* Play indicator overlay */}
                    {isPlaying && (
                      <div 
                        className="position-absolute top-0 start-0 h-100 bg-primary" 
                        style={{ 
                          width: '3px', 
                          animation: 'progress 1s linear infinite',
                          zIndex: 10
                        }}
                      />
                    )}
                  </div>

                  {/* Custom Audio Controls */}
                  <div className="d-flex align-items-center gap-2">
                    <small className="text-muted" style={{ minWidth: '80px' }}>
                      <i className="bi bi-volume-up me-1"></i>
                      <input
                        type="range"
                        className="form-range"
                        min="0"
                        max="100"
                        defaultValue="100"
                        onChange={(e) => {
                          const audio = audioRefs.current[trackId];
                          if (audio) {
                            audio.volume = e.target.value / 100;
                          }
                        }}
                        style={{ width: '80px', display: 'inline-block' }}
                      />
                    </small>

                    <div className="flex-grow-1">
                      <input
                        type="range"
                        className="form-range"
                        min="0"
                        max="100"
                        defaultValue="0"
                        onChange={(e) => {
                          const audio = audioRefs.current[trackId];
                          if (audio && audio.duration) {
                            audio.currentTime = (e.target.value / 100) * audio.duration;
                          }
                        }}
                        style={{ cursor: 'pointer' }}
                      />
                    </div>

                    <small className="text-muted">
                      <i className="bi bi-download me-1"></i>
                      <a href={audioUrl} download={track.title} className="text-decoration-none">
                        Download
                      </a>
                    </small>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Instructions */}
      {tracks.length > 0 && (
        <div className="alert alert-info mb-0 small">
          <i className="bi bi-info-circle me-2"></i>
          <strong>Tip:</strong> Click the play button (▶️) on any track to listen. Mixed tracks contain both your original and AI-generated audio!
        </div>
      )}

      {/* CSS Animation for play indicator */}
      <style>{`
        @keyframes progress {
          0% { left: 0%; }
          100% { left: 100%; }
        }
      `}</style>
    </div>
  );
};