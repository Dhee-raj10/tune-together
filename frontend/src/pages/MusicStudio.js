// src/pages/MusicStudio.js
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStudio } from '../contexts/StudioContext';
import { useAuth } from '../contexts/AuthContext';
import { StudioLayout } from '../components/studio/StudioLayout';
import { TrackArrangementPanel } from '../components/studio/TrackArrangementPanel';
import { MixerPanel } from '../components/studio/MixerPanel';
import { AISuggestionPanel } from '../components/studio/AISuggestionPanel';

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
    addTrack
  } = useStudio();

  const [isProjectLoading, setIsProjectLoading] = useState(true);
  const [projectError, setProjectError] = useState(null);

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
        if (isCollaborative) {
             connectToStudio(currentProjectId, projectData);
        } else {
             console.log('Solo project detected. Skipping Socket.IO connection.');
        }

        setIsProjectLoading(false);
      } catch (error) {
        console.error('Studio initialization failed:', error);
        setProjectError(error.response?.data?.msg || 'Failed to load project');
        setIsProjectLoading(false);
      }
    };

    initializeStudio();

    return () => {
      disconnectFromStudio();
    };
  }, [currentProjectId, user, loadProject, connectToStudio, disconnectFromStudio, navigate]);

  const handleSaveAndExit = () => {
    disconnectFromStudio();
    navigate('/my-projects');
  };

  if (!user) {
    return null;
  }

  if (isProjectLoading) { 
    return (
      <div style={{ padding: '20px' }}>
        <h2>Loading Studio...</h2>
        <p>Project ID: {currentProjectId}</p>
        {projectError && <p style={{ color: 'red' }}>Error: {projectError}</p>}
      </div>
    );
  }

  if (projectError) {
    return (
      <div style={{ padding: '20px' }}>
        <h2>Studio Error</h2>
        <p style={{ color: 'red' }}>{projectError}</p>
        <p>Project ID: {currentProjectId}</p>
        <button onClick={() => navigate('/explore')}>Back to Explore</button>
      </div>
    );
  }
  
  const activeProjectId = studioContextProjectId || currentProjectId;

  return (
    <StudioLayout
      title={projectMetadata.title || 'Loading...'}
      mode={projectMetadata.mode}
      onSaveAndExit={handleSaveAndExit}
    >
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
    </StudioLayout>
  );
}