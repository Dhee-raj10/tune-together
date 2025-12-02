// frontend/src/pages/MusicStudio.js - CYAN THEME
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStudio } from '../contexts/StudioContext';
import { useAuth } from '../contexts/AuthContext';
import { Navbar } from '../components/Navbar';
import { TrackArrangementPanel } from '../components/studio/TrackArrangementPanel';
import { MixerPanel } from '../components/studio/MixerPanel';
import { AISuggestionPanel } from '../components/studio/AISuggestionPanel';
import api from '../services/api';
import { toast } from '../hooks/use-toast';

export default function MusicStudio() {
  const { id, projectId: collabProjectId } = useParams();
  const currentProjectId = collabProjectId || id; 
  
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    projectId: studioContextProjectId,
    loadProject,
    connectToStudio,
    disconnectFromStudio,
    projectMetadata,
    tracks,
    addTrack,
    socket,
    loadTracks,
  } = useStudio();

  const [isProjectLoading, setIsProjectLoading] = useState(true);
  const [projectError, setProjectError] = useState(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [projectType, setProjectType] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const initializeStudio = async () => {
      if (!currentProjectId) {
        setProjectError('No project ID provided');
        setIsProjectLoading(false);
        return;
      }
      
      try {
        setIsProjectLoading(true);
        setProjectError(null);

        const projectData = await loadProject(currentProjectId);
        
        if (!projectData) {
          setProjectError('Project not found or access denied');
          setIsProjectLoading(false);
          return;
        }

        const isCollaborative = projectData.mode === 'collaborative' || projectData.sessionId;
        setProjectType(isCollaborative ? 'collaborative' : 'solo');

        if (isCollaborative) {
          connectToStudio(currentProjectId, projectData);
        } else {
          await loadTracks(currentProjectId, false);
        }

        setIsProjectLoading(false);
      } catch (error) {
        console.error('❌ Studio initialization failed:', error);
        setProjectError(error.response?.data?.msg || 'Failed to load project');
        setIsProjectLoading(false);
      }
    };

    initializeStudio();

    return () => {
      disconnectFromStudio();
    };
  }, [currentProjectId, user, loadProject, connectToStudio, disconnectFromStudio, loadTracks, navigate]);

  const handleRequestSaveAndExit = () => {
    setShowSaveDialog(true);
  };

  const handleSaveAndExit = async () => {
    setIsSaving(true);

    try {
      const savePayload = {
        name: projectMetadata?.name || projectMetadata?.title || 'Untitled',
        title: projectMetadata?.name || projectMetadata?.title || 'Untitled',
        description: projectMetadata?.description || '',
        bpm: projectMetadata?.bpm || projectMetadata?.tempo || 120,
        tempo: projectMetadata?.bpm || projectMetadata?.tempo || 120,
        timeSignature: projectMetadata?.timeSignature || '4/4',
        keySignature: projectMetadata?.keySignature || '',
        master_volume: projectMetadata?.master_volume || 0.8,
        metadata: {
          lastModified: new Date().toISOString(),
          trackCount: tracks.length,
        }
      };

      let response;

      if (projectType === 'collaborative') {
        response = await api.put(`/collaboration/projects/${currentProjectId}`, savePayload);
        
        if (socket && socket.connected) {
          socket.emit('project-updated', {
            projectId: currentProjectId,
            updateType: 'save-and-exit',
            metadata: savePayload.metadata,
            timestamp: new Date().toISOString()
          });
        }
      } else {
        response = await api.put(`/projects/${currentProjectId}`, savePayload);
      }

      toast({ 
        title: 'Project Saved!', 
        description: `Saved ${tracks.length} track${tracks.length !== 1 ? 's' : ''} successfully.`,
        variant: 'success' 
      });

      if (projectType === 'collaborative' && socket && socket.connected) {
        socket.emit('leave-session', { 
          projectId: currentProjectId, 
          sessionId: projectMetadata?.sessionId 
        });
        await new Promise(resolve => setTimeout(resolve, 300));
        socket.disconnect();
      }

      await new Promise(resolve => setTimeout(resolve, 500));
      navigate('/my-projects');

    } catch (error) {
      console.error('❌ Save error:', error);
      toast({ 
        title: 'Save Failed', 
        description: error.response?.data?.error || error.message,
        variant: 'error' 
      });
      setIsSaving(false);
    }
  };

  const handleExitWithoutSaving = () => {
    if (projectType === 'collaborative' && socket && socket.connected) {
      socket.emit('leave-session', { 
        projectId: currentProjectId, 
        sessionId: projectMetadata?.sessionId 
      });
      socket.disconnect();
    }
    
    toast({ 
      title: 'Exited Without Saving', 
      description: 'Changes were not saved.',
      variant: 'default' 
    });
    
    navigate('/my-projects');
  };

  if (!user) return null;

  if (isProjectLoading) { 
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ 
        minHeight: '100vh',
        background: 'rgba(0, 198, 209, 0.08)'
      }}>
        <div className="text-center">
          <div className="spinner-border mb-3" style={{ 
            width: '3rem', 
            height: '3rem',
            color: '#00C6D1'
          }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <h3 style={{ color: '#00C6D1' }}>Loading Studio...</h3>
        </div>
      </div>
    );
  }

  if (projectError) {
    return (
      <>
        <Navbar />
        <div className="container py-5">
          <div className="alert" style={{
            background: 'rgba(220, 38, 38, 0.1)',
            border: '2px solid #dc2626',
            color: '#dc2626'
          }}>
            <h4>Studio Error</h4>
            <p>{projectError}</p>
            <button onClick={() => navigate('/explore')} className="btn btn-primary mt-3">
              Back to Explore
            </button>
          </div>
        </div>
      </>
    );
  }
  
  const activeProjectId = studioContextProjectId || currentProjectId;
  const isCollaborative = projectType === 'collaborative';
  const uploadedCount = tracks.filter(t => !t.isAIGenerated && !t.title?.includes('AI')).length;
  const aiCount = tracks.filter(t => t.isAIGenerated || t.title?.includes('AI')).length;

  return (
    <div style={{ 
      minHeight: '100vh',
      background: 'rgba(0, 198, 209, 0.08)'
    }}>
      <Navbar />
      
      {/* Studio Header */}
      <div style={{ 
        background: 'rgba(0, 198, 209, 0.15)',
        borderBottom: '2px solid #00C6D1',
        boxShadow: '0 4px 20px rgba(0, 198, 209, 0.2)'
      }}>
        <div className="container py-3">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-3">
              <button 
                onClick={() => navigate('/my-projects')} 
                className="btn"
                style={{
                  background: 'rgba(0, 198, 209, 0.2)',
                  border: '1px solid #00C6D1',
                  color: '#00C6D1'
                }}
              >
                <i className="bi bi-arrow-left"></i>
              </button>
              <div>
                <h1 className="h4 mb-0" style={{ color: '#00C6D1' }}>
                  {projectMetadata.title || 'Untitled Project'}
                </h1>
                <small style={{ color: '#0099A8' }}>
                  <i className={`bi ${isCollaborative ? 'bi-people-fill' : 'bi-person-fill'} me-1`}></i>
                  {isCollaborative ? 'Collaborative' : 'Solo'} mode
                  {isCollaborative && socket?.connected && (
                    <span className="badge ms-2" style={{
                      background: '#10b981',
                      color: '#ffffff'
                    }}>
                      <i className="bi bi-circle-fill" style={{ fontSize: '0.5rem' }}></i> Live
                    </span>
                  )}
                  <span className="badge ms-2" style={{
                    background: 'rgba(0, 198, 209, 0.3)',
                    color: '#00C6D1'
                  }}>
                    {tracks.length} tracks
                  </span>
                </small>
              </div>
            </div>
            
            <button
              onClick={handleRequestSaveAndExit}
              className="btn btn-lg"
              disabled={isSaving}
              style={{
                background: 'linear-gradient(135deg, #00C6D1 0%, #0099A8 100%)',
                color: '#ffffff',
                fontWeight: 'bold',
                border: 'none',
                boxShadow: '0 4px 15px rgba(0, 198, 209, 0.3)'
              }}
            >
              <i className="bi bi-box-arrow-right me-2"></i>
              Save & Exit
            </button>
          </div>
        </div>
      </div>

      {/* Studio Content */}
      <div className="container py-4">
        <div className="row g-4">
          <div className="col-lg-8">
            <div className="card shadow-sm border-0 p-4 mb-4" style={{
              background: 'rgba(255, 255, 255, 0.95)',
              border: '2px solid rgba(0, 198, 209, 0.3)',
              borderRadius: '15px'
            }}>
              <TrackArrangementPanel />
            </div>
          </div>
          <div className="col-lg-4">
            <div className="mb-4">
              <MixerPanel 
                projectId={activeProjectId}
                initialMasterVolume={projectMetadata.master_volume}
                initialTempo={projectMetadata.tempo}
              />
            </div>
            <AISuggestionPanel 
              projectId={activeProjectId}
              onSuggestionAccepted={(newTrack) => {
                if (addTrack) addTrack(newTrack);
              }}
            />
          </div>
        </div>
      </div>

      {/* Save Dialog */}
      {showSaveDialog && (
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0, 0, 0, 0.8)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content" style={{
              background: 'rgba(0, 198, 209, 0.15)',
              border: '2px solid #00C6D1',
              color: '#00C6D1'
            }}>
              <div className="modal-header" style={{ 
                background: 'rgba(0, 198, 209, 0.3)',
                borderBottom: '2px solid #00C6D1'
              }}>
                <h5 className="modal-title" style={{ color: '#00C6D1' }}>
                  <i className="bi bi-question-circle me-2"></i>
                  Save {tracks.length} Track{tracks.length !== 1 ? 's' : ''}?
                </h5>
                <button 
                  className="btn-close" 
                  onClick={() => setShowSaveDialog(false)}
                  style={{ filter: 'invert(1)' }}
                ></button>
              </div>
              
              <div className="modal-body" style={{ color: '#ffffff' }}>
                <div className="alert" style={{
                  background: 'rgba(0, 198, 209, 0.2)',
                  border: '1px solid #00C6D1',
                  color: '#00C6D1'
                }}>
                  <h6><i className="bi bi-database me-2"></i>What will be saved:</h6>
                  <ul className="mb-0">
                    <li><strong>{uploadedCount}</strong> uploaded file{uploadedCount !== 1 ? 's' : ''}</li>
                    <li><strong>{aiCount}</strong> AI-generated track{aiCount !== 1 ? 's' : ''}</li>
                    <li>BPM: {projectMetadata?.bpm || 120}, Time: {projectMetadata?.timeSignature || '4/4'}</li>
                  </ul>
                </div>
                
                <div className="alert" style={{
                  background: 'rgba(251, 191, 36, 0.2)',
                  border: '1px solid #fbbf24',
                  color: '#fbbf24'
                }}>
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  <strong>Warning:</strong> Exiting without saving will discard all changes.
                </div>
              </div>

              <div className="modal-footer flex-column gap-2">
                <button 
                  onClick={handleSaveAndExit} 
                  disabled={isSaving} 
                  className="btn w-100"
                  style={{
                    background: 'linear-gradient(135deg, #00C6D1 0%, #0099A8 100%)',
                    color: '#ffffff',
                    fontWeight: 'bold',
                    border: 'none'
                  }}
                >
                  {isSaving ? 'Saving...' : 'Save & Exit'}
                </button>
                <button 
                  onClick={handleExitWithoutSaving} 
                  disabled={isSaving} 
                  className="btn btn-outline-danger w-100"
                >
                  Exit Without Saving
                </button>
                <button 
                  onClick={() => setShowSaveDialog(false)} 
                  disabled={isSaving} 
                  className="btn w-100"
                  style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    color: '#00C6D1',
                    border: '1px solid #00C6D1'
                  }}
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}