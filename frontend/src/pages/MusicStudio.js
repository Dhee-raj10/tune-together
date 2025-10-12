import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStudio } from '../contexts/StudioContext';
import { useAuth } from '../contexts/AuthContext';
import { StudioLayout } from '../components/studio/StudioLayout';
import { TrackArrangementPanel } from '../components/studio/TrackArrangementPanel';
import { MixerPanel } from '../components/studio/MixerPanel';
import { AISuggestionPanel } from '../components/studio/AISuggestionPanel';

export default function MusicStudio() {
  const { id } = useParams();
  console.log('MusicStudio - Project id from URL params:', id);
  console.log('MusicStudio - Project id type:', typeof id);
  
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    projectId,
    loadProject,
    connectToStudio,
    disconnectFromStudio,
    projectMetadata,
    tracks,
    addTrack
  } = useStudio();

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const initializeStudio = async () => {
      if (!id) {
        setError('No project ID provided');
        setIsLoading(false);
        return;
      }
      
      console.log('Initializing studio for project:', id);
      
      try {
        setIsLoading(true);
        setError(null);

        const projectData = await loadProject(id);
        if (!projectData) {
          setError('Project not found or access denied');
          setIsLoading(false);
          return;
        }
        console.log('Project loaded successfully:', projectData);

        connectToStudio(id, projectData);
        setIsLoading(false);
      } catch (error) {
        console.error('Studio initialization failed:', error);
        setError(error.response?.data?.msg || 'Failed to load project');
        setIsLoading(false);
      }
    };

    initializeStudio();

    return () => {
      console.log('Cleaning up studio connection');
      disconnectFromStudio();
    };
  }, [id, user, loadProject, connectToStudio, disconnectFromStudio, navigate]);

  const handleSaveAndExit = () => {
    console.log('Saving and exiting studio');
    disconnectFromStudio();
    navigate('/dashboard');
  };

  if (!user) {
    return null;
  }

  if (isLoading) {
    return (
      <div style={{ padding: '20px' }}>
        <h2>Loading Studio...</h2>
        <p>Project ID: {id}</p>
        {error && <p style={{ color: 'red' }}>Error: {error}</p>}
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ padding: '20px' }}>
        <h2>Studio Error</h2>
        <p style={{ color: 'red' }}>{error}</p>
        <p>Project ID: {id}</p>
        <button onClick={() => navigate('/explore')}>Back to Explore</button>
      </div>
    );
  }

  const activeProjectId = projectId || id;
  console.log('Rendering MusicStudio with activeProjectId:', activeProjectId);

  return (
    <StudioLayout
      projectMetadata={projectMetadata}
      onSaveAndExit={handleSaveAndExit}
    >
      <div className="row g-4">
        {/* Left Column - Track Arrangement WITH UPLOADER AT TOP */}
        <div className="col-lg-8">
          <div className="card shadow-sm border-0 p-4 mb-4">
            <TrackArrangementPanel />
          </div>
        </div>

        {/* Right Column - Controls */}
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