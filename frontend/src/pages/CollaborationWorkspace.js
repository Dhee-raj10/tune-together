// src/pages/CollaborationWorkspace.js
// COPY THIS ENTIRE FILE - REPLACE EVERYTHING
// At the top of CollaborationWorkspace.js
//import { SaveExitDialog } from './SaveExitDialog'; // Assuming correct path to the standalone component
import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import api from '../services/api';
import { toast } from '../hooks/use-toast';
import { Navbar } from '../components/Navbar';

const WS_URL = process.env.REACT_APP_WS_URL || 'http://localhost:5000';

// ✅ INLINE DIALOG COMPONENT - NO IMPORTS NEEDED
const SaveExitDialog = ({ isOpen, onClose, projectId, projectData, tracks, socket }) => {
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSaveAndExit = async () => {
    setIsSaving(true);
    console.log('💾 SAVE CLICKED - Starting save...');

    try {
      const savePayload = {
        name: projectData?.name || 'Untitled',
        description: projectData?.description || '',
        bpm: projectData?.bpm || 120,
        timeSignature: projectData?.timeSignature || '4/4',
        metadata: {
          lastModified: new Date().toISOString(),
          trackCount: tracks.length
        }
      };

      console.log('📦 Saving to MongoDB:', savePayload);

      const response = await api.put(`/collaboration/projects/${projectId}`, savePayload);
      
      console.log('✅ MongoDB saved:', response.data);

      // Emit socket event
      if (socket && socket.connected) {
        console.log('📡 Emitting socket event...');
        socket.emit('project-updated', {
          projectId: projectId,
          updateType: 'save-and-exit',
          metadata: savePayload.metadata,
          timestamp: new Date().toISOString()
        });
        console.log('✅ Socket event sent');
      }

      toast({ title: 'Saved!', description: 'Project saved successfully', variant: 'success' });

      // Disconnect and redirect
      if (socket) {
        socket.emit('leave-session', { projectId });
        socket.disconnect();
      }

      setTimeout(() => navigate('/'), 500);

    } catch (error) {
      console.error('❌ Save error:', error);
      alert('Save failed: ' + (error.response?.data?.error || error.message));
      setIsSaving(false);
    }
  };

  const handleExitWithoutSaving = () => {
    console.log('🚪 EXIT WITHOUT SAVING');
    if (socket) {
      socket.emit('leave-session', { projectId });
      socket.disconnect();
    }
    navigate('/');
  };

  const uploadedCount = tracks.filter(t => !t.isAIGenerated).length;
  const aiCount = tracks.filter(t => t.isAIGenerated).length;

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.75)',
      backdropFilter: 'blur(4px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '1rem'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '1rem',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        maxWidth: '32rem',
        width: '100%',
        padding: '2rem',
        animation: 'slideUp 0.3s ease-out'
      }}>
        
        {/* Header */}
        <div style={{ textAlign: 'center', marginBottom: '1.5rem' }}>
          <div style={{
            width: '4rem',
            height: '4rem',
            borderRadius: '9999px',
            background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 1rem',
            boxShadow: '0 10px 15px -3px rgba(59, 130, 246, 0.3)'
          }}>
            <i className="bi bi-question-circle" style={{ fontSize: '2rem', color: 'white' }}></i>
          </div>
          <h2 style={{ fontSize: '1.75rem', fontWeight: 700, color: '#111827', marginBottom: '0.5rem' }}>
            Save Changes?
          </h2>
          <p style={{ fontSize: '1rem', color: '#6b7280', margin: 0 }}>
            You have {tracks.length} track{tracks.length !== 1 ? 's' : ''} in this workspace.
          </p>
        </div>

        {/* Info Box */}
        <div style={{
          background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
          border: '2px solid #93c5fd',
          borderRadius: '0.75rem',
          padding: '1.25rem',
          marginBottom: '1.5rem'
        }}>
          <p style={{ fontWeight: 700, fontSize: '0.9375rem', color: '#1e40af', marginBottom: '1rem' }}>
            <i className="bi bi-database me-2"></i>
            What will be saved to MongoDB:
          </p>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            <li style={{ padding: '0.5rem 0', color: '#1e40af', borderBottom: '1px solid rgba(147, 197, 253, 0.3)' }}>
              <i className="bi bi-music-note-beamed me-2" style={{ color: '#10b981' }}></i>
              <strong>{uploadedCount}</strong> uploaded tracks
            </li>
            <li style={{ padding: '0.5rem 0', color: '#1e40af', borderBottom: '1px solid rgba(147, 197, 253, 0.3)' }}>
              <i className="bi bi-stars me-2" style={{ color: '#10b981' }}></i>
              <strong>{aiCount}</strong> AI tracks
            </li>
            <li style={{ padding: '0.5rem 0', color: '#1e40af' }}>
              <i className="bi bi-people me-2" style={{ color: '#10b981' }}></i>
              Synced with all collaborators
            </li>
          </ul>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1rem' }}>
          <button
            onClick={handleSaveAndExit}
            disabled={isSaving}
            style={{
              width: '100%',
              padding: '1rem',
              borderRadius: '0.625rem',
              fontWeight: 700,
              fontSize: '1rem',
              border: 'none',
              cursor: isSaving ? 'not-allowed' : 'pointer',
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.625rem',
              opacity: isSaving ? 0.6 : 1
            }}
          >
            {isSaving ? (
              <>
                <span style={{
                  width: '1.25rem',
                  height: '1.25rem',
                  border: '3px solid rgba(255, 255, 255, 0.3)',
                  borderTopColor: 'white',
                  borderRadius: '9999px',
                  animation: 'spin 0.6s linear infinite'
                }}></span>
                Saving...
              </>
            ) : (
              <>
                <i className="bi bi-check-lg"></i>
                Save & Exit
              </>
            )}
          </button>

          <button
            onClick={handleExitWithoutSaving}
            disabled={isSaving}
            style={{
              width: '100%',
              padding: '1rem',
              borderRadius: '0.625rem',
              fontWeight: 700,
              fontSize: '1rem',
              border: '2px solid #fca5a5',
              cursor: isSaving ? 'not-allowed' : 'pointer',
              background: '#fef2f2',
              color: '#dc2626',
              opacity: isSaving ? 0.6 : 1
            }}
          >
            <i className="bi bi-x-lg me-2"></i>
            Exit Without Saving
          </button>

          <button
            onClick={onClose}
            disabled={isSaving}
            style={{
              width: '100%',
              padding: '1rem',
              borderRadius: '0.625rem',
              fontWeight: 700,
              fontSize: '1rem',
              border: '2px solid #d1d5db',
              cursor: isSaving ? 'not-allowed' : 'pointer',
              background: 'white',
              color: '#374151',
              opacity: isSaving ? 0.6 : 1
            }}
          >
            <i className="bi bi-arrow-left me-2"></i>
            Cancel
          </button>
        </div>

        {/* Warning */}
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          gap: '0.75rem',
          padding: '1rem',
          background: 'linear-gradient(135deg, #fef3c7 0%, #fde68a 100%)',
          border: '2px solid #fbbf24',
          borderRadius: '0.625rem',
          fontSize: '0.875rem',
          color: '#92400e'
        }}>
          <i className="bi bi-exclamation-triangle-fill" style={{ color: '#f59e0b', fontSize: '1.25rem' }}></i>
          <span>Exiting without saving will discard changes permanently.</span>
        </div>

        <style>{`
          @keyframes spin {
            to { transform: rotate(360deg); }
          }
          @keyframes slideUp {
            from { opacity: 0; transform: translateY(30px) scale(0.95); }
            to { opacity: 1; transform: translateY(0) scale(1); }
          }
        `}</style>
      </div>
    </div>
  );
};

// ✅ MAIN COMPONENT
function CollaborationWorkspace() {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const socketRef = useRef(null);

  const [project, setProject] = useState(null);
  const [users, setUsers] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [isConnected, setIsConnected] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [showSaveDialog, setShowSaveDialog] = useState(false);

  useEffect(() => {
    loadProject();
  }, [projectId]);

  useEffect(() => {
    if (project && project.sessionId) {
      initializeSocket();
    }
    return () => {
      if (socketRef.current) socketRef.current.disconnect();
    };
  }, [project]);

  const loadProject = async () => {
    try {
      console.log('📥 Loading project:', projectId);
      const response = await api.get(`/collaboration/projects/${projectId}`);
      const projectData = response.data.project;
      console.log('✅ Project loaded:', projectData);
      
      setProject(projectData);
      setTracks(projectData.tracks || []);
    } catch (err) {
      console.error('❌ Load error:', err);
      toast({ title: 'Failed to load project', variant: 'error' });
    } finally {
      setLoading(false);
    }
  };

  const initializeSocket = () => {
    const token = localStorage.getItem('token');
    console.log('🔌 Connecting socket...');
    
    socketRef.current = io(WS_URL, { 
      auth: { token },
      transports: ['websocket', 'polling']
    });

    socketRef.current.on('connect', () => {
      console.log('✅ Socket connected');
      setIsConnected(true);
      socketRef.current.emit('join-session', {
        projectId,
        sessionId: project.sessionId
      });
    });

    socketRef.current.on('disconnect', () => {
      console.log('❌ Socket disconnected');
      setIsConnected(false);
    });

    socketRef.current.on('session-state', (state) => {
      console.log('📊 Session state:', state);
      setUsers(state.users || []);
      setTracks(state.tracks || []);
    });

    socketRef.current.on('user-joined', (data) => {
      console.log('👤 User joined:', data.username);
      setUsers(prev => [...prev, data]);
      toast({ title: `${data.username} joined`, variant: 'success' });
    });

    socketRef.current.on('user-left', ({ userId, username }) => {
      setUsers(prev => prev.filter(u => u.userId !== userId));
      toast({ title: `${username} left` });
    });

    socketRef.current.on('track-added', ({ track, username }) => {
      console.log('🎵 Track added:', track);
      setTracks(prev => [...prev, track]);
      toast({ title: `${username} added a track`, variant: 'success' });
    });

    socketRef.current.on('track-deleted', ({ trackId }) => {
      setTracks(prev => prev.filter(t => (t._id || t.id) !== trackId));
    });

    socketRef.current.on('project-updated', (data) => {
      console.log('🔄 Project updated:', data);
      toast({ title: 'Project updated', variant: 'success' });
      loadProject();
    });
  };

  const handleFileSelect = (e) => setSelectedFile(e.target.files[0]);

  const uploadTrack = async () => {
    if (!selectedFile) return toast({ title: 'Select a file', variant: 'error' });

    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('track', selectedFile);
      formData.append('title', selectedFile.name.replace(/\.[^/.]+$/, ''));
      formData.append('duration', 0);
      formData.append('instrument', 'Unknown');
      formData.append('isAIGenerated', false);

      await api.post(`/collaboration/projects/${projectId}/tracks`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast({ title: 'Track uploaded!', variant: 'success' });
      setSelectedFile(null);
    } catch (error) {
      console.error('❌ Upload error:', error);
      toast({ title: 'Upload failed', variant: 'error' });
    } finally {
      setUploading(false);
    }
  };

  const deleteTrack = async (trackId) => {
    if (!window.confirm('Delete this track?')) return;
    try {
      await api.delete(`/collaboration/projects/${projectId}/tracks/${trackId}`);
      toast({ title: 'Track deleted', variant: 'success' });
    } catch (error) {
      console.error('❌ Delete error:', error);
      toast({ title: 'Delete failed', variant: 'error' });
    }
  };

  const handleRequestExit = () => {
    console.log('🚪 EXIT BUTTON CLICKED');
    console.log('showSaveDialog before:', showSaveDialog);
    setShowSaveDialog(true);
    console.log('showSaveDialog after: should be true');
  };

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="container py-5 text-center">
          <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <h3>Loading Workspace...</h3>
        </div>
      </>
    );
  }

  if (!project) {
    return (
      <>
        <Navbar />
        <div className="container py-5">
          <div className="alert alert-danger">
            <h4>Project Not Found</h4>
            <button onClick={() => navigate('/my-projects')} className="btn btn-primary mt-3">
              Go to My Projects
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />

      <div className="container py-4">
        
        {/* Header */}
        <div className="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
          <div>
            <h2 className="mb-1">{project.name || 'Untitled'}</h2>
            <p className="text-muted mb-0">{project.description}</p>
          </div>

          <div className="d-flex align-items-center gap-3">
            <span className={`badge ${isConnected ? 'bg-success' : 'bg-danger'}`}>
              {isConnected ? '🟢 Connected' : '🔴 Disconnected'}
            </span>

            <button 
              onClick={handleRequestExit}
              className="btn btn-primary btn-lg"
            >
              <i className="bi bi-box-arrow-right me-2"></i>
              Request Save & Exit
            </button>
          </div>
        </div>

        {/* Active Users */}
        <div className="alert alert-info mb-4">
          <strong><i className="bi bi-people-fill me-2"></i>Active ({users.length}):</strong>{" "}
          {users.length > 0 ? users.map(u => u.username).join(', ') : 'Only you'}
        </div>

        {/* Upload */}
        <div className="card mb-4 p-4 shadow-sm">
          <h3 className="h5 mb-3">Upload Track</h3>
          <div className="row align-items-end g-3">
            <div className="col-md-8">
              <input
                type="file"
                className="form-control"
                accept="audio/*"
                onChange={handleFileSelect}
                disabled={uploading}
              />
              {selectedFile && (
                <small className="text-muted d-block mt-2">
                  Selected: {selectedFile.name}
                </small>
              )}
            </div>
            <div className="col-md-4">
              <button
                onClick={uploadTrack}
                disabled={uploading || !selectedFile}
                className="btn btn-success w-100"
              >
                {uploading ? 'Uploading...' : 'Upload'}
              </button>
            </div>
          </div>
        </div>

        {/* Tracks */}
        <div className="card p-4 shadow-sm">
          <h3 className="h5 mb-3">Tracks ({tracks.length})</h3>
          
          {tracks.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-music-note-beamed" style={{ fontSize: '4rem', color: '#d1d5db' }}></i>
              <h5 className="mt-3 text-muted">No tracks yet</h5>
            </div>
          ) : (
            <div className="row g-3">
              {tracks.map((track, index) => (
                <div key={track._id || index} className="col-md-6">
                  <div className="card border h-100">
                    <div className="card-body">
                      <div className="d-flex justify-content-between align-items-start mb-3">
                        <div className="flex-grow-1">
                          <h6 className="mb-1">{track.name || 'Untitled'}</h6>
                          {track.isAIGenerated && (
                            <span className="badge bg-primary">
                              <i className="bi bi-stars me-1"></i>AI
                            </span>
                          )}
                          <small className="text-muted d-block mt-2">
                            {track.instrument} • {Math.round(track.duration || 0)}s
                          </small>
                        </div>
                        <button
                          onClick={() => deleteTrack(track._id || track.id)}
                          className="btn btn-sm btn-outline-danger"
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                      {track.audioFileUrl && (
                        <audio controls className="w-100" src={`http://localhost:5000${track.audioFileUrl}`} />
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Debug Info */}
        <div className="alert alert-secondary mt-4">
          <strong>Debug:</strong> showSaveDialog = {showSaveDialog ? '✅ TRUE' : '❌ FALSE'}
        </div>
      </div>

      {/* Save Dialog */}
      <SaveExitDialog
        isOpen={showSaveDialog}
        onClose={() => setShowSaveDialog(false)}
        projectId={projectId}
        projectData={project}
        tracks={tracks}
        socket={socketRef.current}
      />
    </>
  );
}

export default CollaborationWorkspace;