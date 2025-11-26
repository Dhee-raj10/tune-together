// frontend/src/pages/MusicStudio.js - COMPLETE FIX
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
    loadTracks, // ✅ CRITICAL: Use this to reload tracks
  } = useStudio();

  const [isProjectLoading, setIsProjectLoading] = useState(true);
  const [projectError, setProjectError] = useState(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [projectType, setProjectType] = useState(null);

  // ✅ CRITICAL FIX: Reload tracks whenever component mounts or projectId changes
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

        console.log('📥 Initializing studio for project:', currentProjectId);
        
        // ✅ STEP 1: Load project data
        const projectData = await loadProject(currentProjectId);
        
        if (!projectData) {
          setProjectError('Project not found or access denied');
          setIsProjectLoading(false);
          return;
        }

        console.log('✅ Project loaded:', projectData);

        // ✅ STEP 2: Determine project type
        const isCollaborative = projectData.mode === 'collaborative' || projectData.sessionId;
        setProjectType(isCollaborative ? 'collaborative' : 'solo');
        
        console.log('📊 Project type:', isCollaborative ? 'COLLABORATIVE' : 'SOLO');

        // ✅ STEP 3: For collaborative, connect to WebSocket
        if (isCollaborative) {
          console.log('🔌 Connecting to collaborative session...');
          connectToStudio(currentProjectId, projectData);
        } else {
          // ✅ CRITICAL FIX: For solo projects, explicitly reload tracks
          console.log('📝 Solo project - loading tracks from database...');
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
      console.log('🧹 Cleaning up studio...');
      disconnectFromStudio();
    };
  }, [currentProjectId, user, loadProject, connectToStudio, disconnectFromStudio, loadTracks, navigate]);

  const handleRequestSaveAndExit = () => {
    console.log('🚪 EXIT BUTTON CLICKED');
    setShowSaveDialog(true);
  };

  const handleSaveAndExit = async () => {
    console.log('💾 SAVE & EXIT STARTED');
    console.log('   Project Type:', projectType);
    console.log('   Project ID:', currentProjectId);
    console.log('   Tracks to save:', tracks.length);
    
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

      console.log('📦 Save payload:', savePayload);

      let response;

      if (projectType === 'collaborative') {
        console.log('🔄 Saving COLLABORATIVE project');
        response = await api.put(`/collaboration/projects/${currentProjectId}`, savePayload);
        
        if (socket && socket.connected) {
          console.log('📡 Emitting project-updated event...');
          socket.emit('project-updated', {
            projectId: currentProjectId,
            updateType: 'save-and-exit',
            metadata: savePayload.metadata,
            timestamp: new Date().toISOString()
          });
        }
      } else {
        console.log('💾 Saving SOLO project');
        response = await api.put(`/projects/${currentProjectId}`, savePayload);
      }

      console.log('✅ Save response:', response.data);

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
      
      console.log('🏠 Redirecting to /my-projects');
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
    console.log('🚪 EXIT WITHOUT SAVING');
    
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
      <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '100vh' }}>
        <div className="text-center">
          <div className="spinner-border text-primary mb-3" style={{ width: '3rem', height: '3rem' }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <h3>Loading Studio...</h3>
          <p className="text-muted">Project ID: {currentProjectId}</p>
        </div>
      </div>
    );
  }

  if (projectError) {
    return (
      <>
        <Navbar />
        <div className="container py-5">
          <div className="alert alert-danger">
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

  // ✅ DEBUG: Show current track count
  console.log('🎵 Current tracks in UI:', tracks.length);

  return (
    <>
      <Navbar />
      
      <div className="bg-light border-bottom">
        <div className="container py-3">
          <div className="d-flex justify-content-between align-items-center">
            <div className="d-flex align-items-center gap-3">
              <button onClick={() => navigate('/my-projects')} className="btn btn-outline-secondary">
                <i className="bi bi-arrow-left"></i>
              </button>
              <div>
                <h1 className="h4 mb-0">{projectMetadata.title || 'Untitled Project'}</h1>
                <small className="text-muted">
                  <i className={`bi ${isCollaborative ? 'bi-people-fill' : 'bi-person-fill'} me-1`}></i>
                  {isCollaborative ? 'Collaborative' : 'Solo'} mode
                  {isCollaborative && socket?.connected && (
                    <span className="badge bg-success ms-2">
                      <i className="bi bi-circle-fill" style={{ fontSize: '0.5rem' }}></i> Live
                    </span>
                  )}
                  {/* ✅ DEBUG INFO */}
                  <span className="badge bg-info ms-2">{tracks.length} tracks loaded</span>
                </small>
              </div>
            </div>
            
            <button
              onClick={handleRequestSaveAndExit}
              className="btn btn-primary"
              disabled={isSaving}
            >
              <i className="bi bi-box-arrow-right me-2"></i>
              Save & Exit
            </button>
          </div>
        </div>
      </div>

      <div className="container py-4">
        <div className="row g-4">
          <div className="col-lg-8">
            <div className="card shadow-sm border-0 p-4 mb-4">
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
        <div className="modal show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}>
          <div className="modal-dialog modal-dialog-centered modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <i className="bi bi-question-circle me-2"></i>
                  Save {tracks.length} Track{tracks.length !== 1 ? 's' : ''}?
                </h5>
                <button className="btn-close btn-close-white" onClick={() => setShowSaveDialog(false)}></button>
              </div>
              
              <div className="modal-body">
                <div className="alert alert-info">
                  <h6><i className="bi bi-database me-2"></i>What will be saved:</h6>
                  <ul className="mb-0">
                    <li><strong>{uploadedCount}</strong> uploaded file{uploadedCount !== 1 ? 's' : ''}</li>
                    <li><strong>{aiCount}</strong> AI-generated track{aiCount !== 1 ? 's' : ''}</li>
                    <li>BPM: {projectMetadata?.bpm || 120}, Time: {projectMetadata?.timeSignature || '4/4'}</li>
                  </ul>
                </div>
                
                <div className="alert alert-warning">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  <strong>Warning:</strong> Exiting without saving will discard all changes.
                </div>
              </div>

              <div className="modal-footer flex-column gap-2">
                <button onClick={handleSaveAndExit} disabled={isSaving} className="btn btn-success w-100">
                  {isSaving ? 'Saving...' : 'Save & Exit'}
                </button>
                <button onClick={handleExitWithoutSaving} disabled={isSaving} className="btn btn-outline-danger w-100">
                  Exit Without Saving
                </button>
                <button onClick={() => setShowSaveDialog(false)} disabled={isSaving} className="btn btn-outline-secondary w-100">
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}