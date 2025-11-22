import { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import api from '../services/api';
import { toast } from '../hooks/use-toast';
import { ProgressBar, Button, Form, Card } from 'react-bootstrap';

export const TrackUploader = ({ projectId, onUploadComplete }) => {
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

    const allowedTypes = ['audio/mpeg', 'audio/wav', 'audio/ogg', 'audio/mp3'];
    if (!allowedTypes.includes(file.type)) {
      toast({
        title: 'Error',
        description: 'Unsupported file format. Please upload MP3, WAV, or OGG files.',
        variant: 'error',
      });
      return;
    }

    setSelectedFile(file);
    const duration = await getTrackDuration(file);
    setTrackDuration(duration);
  };

  const uploadTrack = async () => {
    if (!selectedFile) {
      toast({
        title: 'Error',
        description: 'Please select a file to upload',
        variant: 'error',
      });
      return;
    }

    if (!projectId) {
      toast({
        title: 'Error',
        description: 'No project ID provided',
        variant: 'error',
      });
      return;
    }

    const formData = new FormData();
    formData.append('track', selectedFile);
    formData.append('title', selectedFile.name.replace(/\.[^/.]+$/, ''));
    formData.append('duration', trackDuration || 0);

    try {
      setIsUploading(true);
      setUploadProgress(0);

      const response = await api.post(`/projects/${projectId}/tracks`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          setUploadProgress(percentCompleted);
        },
      });

      toast({
        title: 'Success',
        description: 'Track uploaded successfully!',
        variant: 'success',
      });

      if (onUploadComplete) {
        onUploadComplete(response.data);
      }

      setSelectedFile(null);
      setTrackDuration(null);
      setUploadProgress(0);
    } catch (error) {
      console.error('Error uploading track:', error);
      toast({
        title: 'Error',
        description: error.response?.data?.msg || 'Failed to upload track',
        variant: 'error',
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Card className="p-4 mt-3 shadow-sm rounded-4">
      <h5 className="mb-3">Select Audio File</h5>
      <Form.Group controlId="formFile" className="mb-3">
        <Form.Control
          type="file"
          accept="audio/*"
          onChange={handleFileSelect}
          disabled={isUploading}
        />
        <Form.Text className="text-muted">
          Supported formats: MP3, WAV, OGG (Max 50MB)
        </Form.Text>
      </Form.Group>

      {selectedFile && (
        <div className="mt-3 border rounded p-2 bg-light">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <strong>{selectedFile.name}</strong>
              <div className="text-muted small">
                {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                {trackDuration && ` • ${Math.round(trackDuration)}s`}
              </div>
            </div>
          </div>
        </div>
      )}

      {isUploading && (
        <div className="mt-3">
          <ProgressBar now={uploadProgress} label={`${uploadProgress}%`} />
        </div>
      )}

      <div className="d-flex justify-content-end mt-3">
        <Button
          variant="primary"
          onClick={uploadTrack}
          disabled={isUploading || !selectedFile}
        >
          {isUploading ? `Uploading ${uploadProgress}%` : 'Upload Track'}
        </Button>
      </div>
    </Card>
  );
};
