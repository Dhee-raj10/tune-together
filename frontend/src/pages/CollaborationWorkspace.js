import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import io from 'socket.io-client';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const WS_URL = process.env.REACT_APP_WS_URL || 'http://localhost:5000';

function CollaborationWorkspace() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const socketRef = useRef(null);

  const [project, setProject] = useState(null);
  const [users, setUsers] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [selectedTrack, setSelectedTrack] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProject();
    initializeSocket();

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, [projectId]);

  const loadProject = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/collaboration/projects/${projectId}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      setProject(response.data.project);
      setTracks(response.data.project.tracks || []);
    } catch (error) {
      console.error('Error loading project:', error);
      alert('Failed to load project');
      navigate('/my-projects');
    } finally {
      setLoading(false);
    }
  };

  const initializeSocket = () => {
    const token = localStorage.getItem('token');
    
    socketRef.current = io(WS_URL, {
      auth: { token }
    });

    socketRef.current.on('connect', () => {
      setIsConnected(true);
      socketRef.current.emit('join-session', {
        projectId,
        sessionId: project?.sessionId
      });
    });

    socketRef.current.on('session-state', (state) => {
      setUsers(state.users);
      setTracks(state.tracks);
    });

    socketRef.current.on('user-joined', (user) => {
      setUsers(prev => [...prev, user]);
    });

    socketRef.current.on('user-left', ({ userId }) => {
      setUsers(prev => prev.filter(u => u.userId !== userId));
    });

    socketRef.current.on('track-added', ({ track }) => {
      setTracks(prev => [...prev, track]);
    });

    socketRef.current.on('track-updated', ({ trackId, updates }) => {
      setTracks(prev => prev.map(t => 
        t._id === trackId ? { ...t, ...updates } : t
      ));
    });

    socketRef.current.on('track-deleted', ({ trackId }) => {
      setTracks(prev => prev.filter(t => t._id !== trackId));
    });

    socketRef.current.on('disconnect', () => {
      setIsConnected(false);
    });
  };

  const addTrack = () => {
    const trackName = prompt('Track name:');
    if (!trackName) return;

    const instrument = prompt('Instrument (e.g., Piano, Drums, Guitar):') || 'Synth';
    
    socketRef.current?.emit('track-add', {
      trackData: {
        name: trackName,
        instrument: instrument,
        notes: []
      }
    });
  };

  const updateTrack = (trackId, updates) => {
    socketRef.current?.emit('track-update', {
      trackId,
      updates
    });
  };

  const deleteTrack = (trackId) => {
    if (!window.confirm('Delete this track?')) return;
    
    socketRef.current?.emit('track-delete', { trackId });
  };

  const togglePlay = () => {
    const newState = !isPlaying;
    setIsPlaying(newState);
    socketRef.current?.emit('play-state', {
      isPlaying: newState
    });
  };

  const saveProject = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `${API_URL}/api/collaboration/projects/${projectId}`,
        {
          name: project.name,
          description: project.description,
          bpm: project.bpm
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      alert('Project saved successfully!');
    } catch (error) {
      console.error('Error saving project:', error);
      alert('Failed to save project');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary"></div>
        </div>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="container py-5">
        <div className="alert alert-danger">Project not found</div>
      </div>
    );
  }

  return (
    <div className="container-fluid py-4" style={{ backgroundColor: '#1a1a2e', minHeight: '100vh', color: 'white' }}>
      {/* Header */}
      <div className="mb-4">
        <div className="d-flex justify-content-between align-items-center mb-3">
          <div className="d-flex align-items-center gap-3">
            <button
              className="btn btn-secondary"
              onClick={() => navigate('/my-projects')}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Back
            </button>
            
            <div>
              <h2 className="mb-0">{project.name}</h2>
              <small className="text-muted">{project.description}</small>
            </div>

            <span className={`badge ${isConnected ? 'bg-success' : 'bg-danger'}`}>
              {isConnected ? '● Connected' : '● Disconnected'}
            </span>
          </div>

          <button
            className="btn btn-success"
            onClick={saveProject}
            disabled={saving}
          >
            {saving ? (
              <>
                <span className="spinner-border spinner-border-sm me-2"></span>
                Saving...
              </>
            ) : (
              <>
                <i className="bi bi-save me-2"></i>
                Save Project
              </>
            )}
          </button>
        </div>

        {/* Active Users */}
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <small className="text-muted">Active ({users.length}):</small>
          {users.map(user => (
            <span
              key={user.userId}
              className="badge"
              style={{ backgroundColor: user.color }}
            >
              {user.username}
            </span>
          ))}
        </div>
      </div>

      {/* Transport Controls */}
      <div className="card bg-dark text-white mb-4">
        <div className="card-body">
          <div className="d-flex justify-content-between align-items-center">
            <div className="btn-group">
              <button
                className="btn btn-primary"
                onClick={togglePlay}
              >
                <i className={`bi ${isPlaying ? 'bi-pause-fill' : 'bi-play-fill'} me-2`}></i>
                {isPlaying ? 'Pause' : 'Play'}
              </button>
              <button
                className="btn btn-secondary"
                onClick={() => setIsPlaying(false)}
              >
                <i className="bi bi-stop-fill me-2"></i>
                Stop
              </button>
              <button
                className="btn btn-success"
                onClick={addTrack}
              >
                <i className="bi bi-plus-circle me-2"></i>
                Add Track
              </button>
            </div>

            <div className="d-flex align-items-center gap-3">
              <div>
                <label className="form-label mb-0 me-2">BPM:</label>
                <input
                  type="number"
                  className="form-control form-control-sm d-inline-block"
                  style={{ width: '80px' }}
                  value={project.bpm}
                  onChange={(e) => setProject({...project, bpm: parseInt(e.target.value)})}
                  min="40"
                  max="240"
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Tracks */}
      <div className="card bg-dark text-white">
        <div className="card-body">
          <h4 className="mb-4">
            <i className="bi bi-music-note-list me-2"></i>
            Tracks ({tracks.length})
          </h4>

          {tracks.length === 0 ? (
            <div className="text-center py-5 text-muted">
              <i className="bi bi-music-note" style={{ fontSize: '4rem', opacity: 0.3 }}></i>
              <p className="mt-3">No tracks yet. Add your first track!</p>
            </div>
          ) : (
            <div className="list-group">
              {tracks.map(track => (
                <div
                  key={track._id}
                  className={`list-group-item list-group-item-action bg-secondary text-white mb-2 ${
                    selectedTrack === track._id ? 'active' : ''
                  }`}
                  onClick={() => setSelectedTrack(track._id)}
                  style={{ cursor: 'pointer' }}
                >
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="flex-grow-1">
                      <h6 className="mb-1">{track.name}</h6>
                      <small className="text-muted">{track.instrument}</small>
                    </div>

                    <div className="d-flex align-items-center gap-3">
                      <div className="d-flex align-items-center">
                        <i className="bi bi-volume-up me-2"></i>
                        <input
                          type="range"
                          className="form-range"
                          style={{ width: '100px' }}
                          min="0"
                          max="1"
                          step="0.01"
                          value={track.volume || 1}
                          onChange={(e) => updateTrack(track._id, { volume: parseFloat(e.target.value) })}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>

                      <button
                        className="btn btn-sm btn-danger"
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteTrack(track._id);
                        }}
                      >
                        <i className="bi bi-trash"></i>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CollaborationWorkspace;