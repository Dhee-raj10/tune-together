import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useStudio } from '../contexts/StudioContext';
import { useAuth } from '../contexts/AuthContext';
import { StudioLayout } from '../components/studio/StudioLayout';
import { TrackArrangementPanel } from '../components/studio/TrackArrangementPanel';
import { MixerPanel } from '../components/studio/MixerPanel';
import { AISuggestionPanel } from '../components/studio/AISuggestionPanel';  // Import TrackUploader
import { TrackUploader } from '../components/TrackUploader';

export default function MusicStudio() {
  const { id } = useParams();
  console.log('Project id from URL params:', id);
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    loadProject,
    connectToStudio,
    disconnectFromStudio,
    projectMetadata,
    tracks,
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
      <div>
        <h2>Loading Studio...</h2>
        <p>Project ID: {id}</p>
        {error && <p>Error: {error}</p>}
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h2>Studio Error</h2>
        <p>{error}</p>
        <p>Project ID: {id}</p>
      </div>
    );
  }

  return (
    <StudioLayout
      projectMetadata={projectMetadata}
      onSaveAndExit={handleSaveAndExit}
    >
      <TrackArrangementPanel tracks={tracks} />
      <MixerPanel tracks={tracks} />
      <AISuggestionPanel projectId={id} />
      {/* Pass projectId prop to TrackUploader */}
      <TrackUploader
        projectId={id}
        onUploadComplete={() => {
          // Reload the project or tracks after successful upload
          loadProject(id);
        }}
      />
    </StudioLayout>
  );
}
