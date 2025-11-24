// src/pages/MusicStudio.js - FIXED WITH SMART SAVE LOGIC
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
    socket
  } = useStudio();

  const [isProjectLoading, setIsProjectLoading] = useState(true);
  const [projectError, setProjectError] = useState(null);
  const [showSaveDialog, setShowSaveDialog] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [projectType, setProjectType] = useState(null); // 'solo' or 'collaborative'

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

        console.log('📥 Loading project:', currentProjectId);
        const projectData = await loadProject(currentProjectId);
        
        if (!projectData) {
          setProjectError('Project not found or access denied');
          setIsProjectLoading(false);
          return;
        }

        console.log('✅ Project loaded:', projectData);

        // ✅ CRITICAL: Determine project type
        const isCollaborative = projectData.mode === 'collaborative' || projectData.sessionId;
        setProjectType(isCollaborative ? 'collaborative' : 'solo');
        
        console.log('📊 Project type:', isCollaborative ? 'COLLABORATIVE' : 'SOLO');

        if (isCollaborative) {
          console.log('🔌 Connecting to collaborative session...');
          connectToStudio(currentProjectId, projectData);
        } else {
          console.log('📝 Solo project - no WebSocket needed');
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
  }, [currentProjectId, user, loadProject, connectToStudio, disconnectFromStudio, navigate]);

  const handleRequestSaveAndExit = () => {
    console.log('🚪 EXIT BUTTON CLICKED');
    console.log('   Project type:', projectType);
    console.log('   Current project:', currentProjectId);
    console.log('   Tracks:', tracks?.length || 0);
    console.log('   Socket connected:', socket?.connected);
    
    setShowSaveDialog(true);
    console.log('✅ Dialog state set to TRUE');
  };

  // ✅ SMART SAVE: Uses correct endpoint based on project type
  const handleSaveAndExit = async () => {
    console.log('💾 SAVE & EXIT STARTED');
    console.log('   Project Type:', projectType);
    console.log('   Project ID:', currentProjectId);
    
    setIsSaving(true);

    try {
      // ✅ Prepare save payload
      const savePayload = {
        name: projectMetadata?.name || projectMetadata?.title || 'Untitled',
        title: projectMetadata?.name || projectMetadata?.title || 'Untitled', // For solo projects
        description: projectMetadata?.description || '',
        bpm: projectMetadata?.bpm || projectMetadata?.tempo || 120,
        tempo: projectMetadata?.bpm || projectMetadata?.tempo || 120, // For solo projects
        timeSignature: projectMetadata?.timeSignature || '4/4',
        keySignature: projectMetadata?.keySignature || '',
        master_volume: projectMetadata?.master_volume || 0.8,
        metadata: {
          lastModified: new Date().toISOString(),
          trackCount: tracks.length,
          uploadedTracksCount: tracks.filter(t => !t.isAIGenerated && !t.title?.includes('AI')).length,
          aiTracksCount: tracks.filter(t => t.isAIGenerated || t.title?.includes('AI')).length
        }
      };

      console.log('📦 Save payload:', savePayload);

      let response;

      // ✅ CRITICAL: Use correct endpoint based on project type
      if (projectType === 'collaborative') {
        console.log('🔄 Saving COLLABORATIVE project to /collaboration/projects/:id');
        
        response = await api.put(
          `/collaboration/projects/${currentProjectId}`, 
          savePayload
        );
        
        console.log('✅ Collaborative project saved to MongoDB');
        
        // ✅ Emit Socket.IO event for real-time sync
        if (socket && socket.connected) {
          console.log('📡 Emitting project-updated event...');
          
          socket.emit('project-updated', {
            projectId: currentProjectId,
            updateType: 'save-and-exit',
            metadata: savePayload.metadata,
            timestamp: new Date().toISOString()
          });

          console.log('✅ Socket event emitted - All collaborators will be notified');
        } else {
          console.warn('⚠️ Socket not connected - real-time sync skipped');
        }

      } else {
        console.log('💾 Saving SOLO project to /projects/:id');
        
        response = await api.put(
          `/projects/${currentProjectId}`, 
          savePayload
        );
        
        console.log('✅ Solo project saved to MongoDB');
      }

      console.log('✅ Save response:', response.data);

      toast({ 
        title: 'Project Saved!', 
        description: `Saved ${tracks.length} track${tracks.length !== 1 ? 's' : ''} successfully.`,
        variant: 'success' 
      });

      // ✅ Disconnect socket (if collaborative)
      if (projectType === 'collaborative' && socket && socket.connected) {
        console.log('🔌 Disconnecting from collaboration session...');
        
        socket.emit('leave-session', { 
          projectId: currentProjectId, 
          sessionId: projectMetadata?.sessionId 
        });
        
        await new Promise(resolve => setTimeout(resolve, 300));
        socket.disconnect();
        
        console.log('✅ Socket disconnected');
      }

      // ✅ Small delay for user feedback
      await new Promise(resolve => setTimeout(resolve, 500));
      
      console.log('🏠 Redirecting to /my-projects');
      navigate('/my-projects');

    } catch (error) {
      console.error('❌ Save error:', error);
      console.error('   Status:', error.response?.status);
      console.error('   Error data:', error.response?.data);
      
      const errorMessage = error.response?.data?.error 
        || error.response?.data?.msg 
        || error.message 
        || 'Unknown error occurred';
      
      toast({ 
        title: 'Save Failed', 
        description: errorMessage,
        variant: 'error' 
      });
      
      setIsSaving(false);
    }
  };

  const handleExitWithoutSaving = () => {
    console.log('🚪 EXIT WITHOUT SAVING');
    console.log('   Project type:', projectType);
    
    if (projectType === 'collaborative' && socket && socket.connected) {
      console.log('🔌 Disconnecting from session...');
      
      socket.emit('leave-session', { 
        projectId: currentProjectId, 
        sessionId: projectMetadata?.sessionId 
      });
      socket.disconnect();
      
      console.log('✅ Socket disconnected');
    }
    
    toast({ 
      title: 'Exited Without Saving', 
      description: 'Changes were not saved.',
      variant: 'default' 
    });
    
    console.log('🏠 Redirecting to /my-projects');
    navigate('/my-projects');
  };

  if (!user) {
    return null;
  }

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
            <p className="mb-0"><small>Project ID: {currentProjectId}</small></p>
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
    <>
      <Navbar />
      
      {/* STUDIO HEADER */}
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
                </small>
              </div>
            </div>
            
            <div className="d-flex align-items-center gap-2">
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
      </div>

      {/* STUDIO CONTENT */}
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

      {/* SAVE EXIT DIALOG */}
      {showSaveDialog && (
        <div 
          className="modal show d-block" 
          style={{ backgroundColor: 'rgba(0,0,0,0.75)' }}
          onClick={() => !isSaving && setShowSaveDialog(false)}
        >
          <div 
            className="modal-dialog modal-dialog-centered modal-lg"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="modal-content">
              
              {/* HEADER */}
              <div className="modal-header bg-primary text-white">
                <div className="text-center w-100">
                  <h5 className="modal-title mb-1">
                    <i className="bi bi-question-circle me-2"></i>
                    Save Changes Before Exiting?
                  </h5>
                  <p className="mb-0 small">
                    <i className={`bi ${isCollaborative ? 'bi-people-fill' : 'bi-person-fill'} me-1`}></i>
                    {isCollaborative ? 'Collaborative' : 'Solo'} Project • {tracks.length} track{tracks.length !== 1 ? 's' : ''}
                  </p>
                </div>
                <button 
                  type="button" 
                  className="btn-close btn-close-white" 
                  onClick={() => setShowSaveDialog(false)}
                  disabled={isSaving}
                ></button>
              </div>

              {/* BODY */}
              <div className="modal-body">
                
                {/* INFO BOX */}
                <div className={`alert ${isCollaborative ? 'alert-info' : 'alert-secondary'}`}>
                  <h6 className="alert-heading">
                    <i className="bi bi-database me-2"></i>
                    What will be saved:
                  </h6>
                  <ul className="mb-0">
                    <li>
                      <i className="bi bi-music-note-beamed me-1"></i>
                      <strong>{uploadedCount}</strong> uploaded audio file{uploadedCount !== 1 ? 's' : ''}
                    </li>
                    <li>
                      <i className="bi bi-stars me-1"></i>
                      <strong>{aiCount}</strong> AI-generated track{aiCount !== 1 ? 's' : ''}
                    </li>
                    <li>
                      <i className="bi bi-sliders me-1"></i>
                      Session settings (BPM: {projectMetadata?.bpm || 120}, Time: {projectMetadata?.timeSignature || '4/4'})
                    </li>
                    {isCollaborative && (
                      <li>
                        <i className="bi bi-people me-1 text-success"></i>
                        <strong className="text-success">Synced with all collaborators via Socket.IO</strong>
                      </li>
                    )}
                    {!isCollaborative && (
                      <li>
                        <i className="bi bi-person me-1 text-primary"></i>
                        <strong className="text-primary">Saved to your personal project</strong>
                      </li>
                    )}
                  </ul>
                </div>

                {/* STATS */}
                <div className="row text-center mb-3">
                  <div className="col-4">
                    <div className="border rounded p-2 bg-light">
                      <h3 className="mb-0 text-primary">{tracks.length}</h3>
                      <small className="text-muted">Total Tracks</small>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="border rounded p-2 bg-light">
                      <h3 className="mb-0 text-success">{uploadedCount}</h3>
                      <small className="text-muted">Uploaded</small>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="border rounded p-2 bg-light">
                      <h3 className="mb-0 text-info">{aiCount}</h3>
                      <small className="text-muted">AI Generated</small>
                    </div>
                  </div>
                </div>

                {/* SAVE LOCATION INFO */}
                <div className={`alert ${isCollaborative ? 'alert-success' : 'alert-info'}`}>
                  <i className={`bi ${isCollaborative ? 'bi-cloud-check' : 'bi-save'} me-2`}></i>
                  <strong>Save Location:</strong>
                  {isCollaborative ? (
                    <span> This will save to the <strong>shared collaborative project</strong>. All collaborators will see the updated project in their "My Projects" page.</span>
                  ) : (
                    <span> This will save to <strong>your personal solo project</strong>. Only you will have access to these changes.</span>
                  )}
                </div>

                {/* WARNING */}
                <div className="alert alert-warning">
                  <i className="bi bi-exclamation-triangle me-2"></i>
                  <strong>Warning:</strong> Exiting without saving will discard all unsaved changes permanently.
                  {isCollaborative && ' Other collaborators will NOT see your unsaved work.'}
                </div>

              </div>

              {/* FOOTER */}
              <div className="modal-footer flex-column gap-2">
                <button
                  onClick={handleSaveAndExit}
                  disabled={isSaving}
                  className="btn btn-success w-100"
                >
                  {isSaving ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2"></span>
                      Saving to {isCollaborative ? 'Collaborative Project' : 'Solo Project'}...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-check-lg me-2"></i>
                      Save & Exit
                    </>
                  )}
                </button>

                <button
                  onClick={handleExitWithoutSaving}
                  disabled={isSaving}
                  className="btn btn-outline-danger w-100"
                >
                  <i className="bi bi-x-lg me-2"></i>
                  Exit Without Saving
                </button>

                <button
                  onClick={() => setShowSaveDialog(false)}
                  disabled={isSaving}
                  className="btn btn-outline-secondary w-100"
                >
                  <i className="bi bi-arrow-left me-2"></i>
                  Cancel
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

      {/* DEBUG INFO */}
      {process.env.NODE_ENV === 'development' && (
        <div 
          style={{
            position: 'fixed',
            bottom: 10,
            right: 10,
            background: 'rgba(0,0,0,0.9)',
            color: 'white',
            padding: '10px',
            borderRadius: '5px',
            fontSize: '11px',
            zIndex: 9998,
            fontFamily: 'monospace'
          }}
        >
          <div><strong>🐛 Debug Info:</strong></div>
          <div>Dialog: {showSaveDialog ? '✅ OPEN' : '❌ CLOSED'}</div>
          <div>Type: {projectType === 'collaborative' ? '🤝 COLLAB' : '👤 SOLO'}</div>
          <div>Tracks: {tracks.length}</div>
          <div>Socket: {socket?.connected ? '✅ Connected' : '❌ Disconnected'}</div>
          <div>Project ID: {currentProjectId?.substring(0, 8)}...</div>
        </div>
      )}
    </>
  );
}