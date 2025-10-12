import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { toast } from '../hooks/use-toast';

export const TrackUploader = ({ projectId, onUploadComplete }) => {
  console.log('TrackUploader received projectId:', projectId);
  console.log('TrackUploader projectId type:', typeof projectId);
  
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [trackDuration, setTrackDuration] = useState(null);
  const { user } = useAuth();

  const getTrackDuration = (file) => {
    return new Promise((resolve) => {
      const audio = new Audio();
      audio.src = URL.createObjectURL(file);
      audio.addEventListener('loadedmetadata', () => {
        resolve(audio.duration);
        URL.revokeObjectURL(audio.src);
      });
      audio.addEventListener('error', () => {
        resolve(0);
        URL.revokeObjectURL(audio.src);
      });
    });
  };

  const handleFileSelect = async (event) => {
    const file = event.target.files[0];
    if (!file) return;
    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg'];
    if (!allowedTypes.includes(file.type)) {
      toast({ title: 'Error', description: 'Unsupported file format', variant: 'error' });
      return;
    }
    setSelectedFile(file);
    const duration = await getTrackDuration(file);
    setTrackDuration(duration);
  };

  const uploadTrack = async () => {
    if (!selectedFile) {
      toast({ title: 'Error', description: 'Please select a file to upload', variant: 'error' });
      return;
    }

    // CRITICAL FIX: Validate and clean projectId
    if (!projectId) {
      console.error('No projectId provided to TrackUploader');
      toast({ title: 'Error', description: 'No project ID provided', variant: 'error' });
      return;
    }

    // Clean the projectId - remove any extra characters, quotes, or whitespace
    const cleanProjectId = String(projectId).trim();
    console.log('Cleaned projectId:', cleanProjectId);
    console.log('Upload URL will be:', `/projects/${cleanProjectId}/tracks`);

    const formData = new FormData();
    formData.append('track', selectedFile);
    formData.append('title', selectedFile.name);
    formData.append('duration', trackDuration || 0);

    try {
      setIsUploading(true);
      setUploadProgress(0);

      const token = user?.token;

      // CRITICAL FIX: Use cleaned projectId
      const response = await api.post(
        `/projects/${cleanProjectId}/tracks`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${token}`,
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          },
        }
      );

      toast({ title: 'Success', description: 'Track uploaded successfully', variant: 'success' });
      onUploadComplete(response.data);
      setSelectedFile(null);
      setTrackDuration(null);
    } catch (error) {
      console.error('Error uploading track:', error);
      console.error('Error response:', error.response?.data);
      console.error('Request URL was:', error.config?.url);
      toast({
        title: 'Error',
        description: error.response?.data?.msg || 'Error: Failed to upload track',
        variant: 'error',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div>
      <input type="file" accept="audio/*" onChange={handleFileSelect} />
      {selectedFile && (
        <div>
          <p>Selected: {selectedFile.name}</p>
          <button onClick={uploadTrack} disabled={isUploading}>
            {isUploading ? `Uploading ${uploadProgress}%` : 'Upload Track'}
          </button>
        </div>
      )}
    </div>
  );
};