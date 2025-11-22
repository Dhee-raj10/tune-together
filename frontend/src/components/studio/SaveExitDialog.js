// src/components/studio/SaveExitDialog.js - REPLACE COMPLETELY
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { toast } from '../../hooks/use-toast';
import './SaveExitDialog.css';

export const SaveExitDialog = ({ 
  isOpen, 
  onClose, 
  projectId,
  projectData,
  tracks = [],
  sessionChanges = {},
  socket = null  // ✅ CRITICAL: Socket for real-time updates
}) => {
  const [isSaving, setIsSaving] = useState(false);
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSaveAndExit = async () => {
    setIsSaving(true);
    
    try {
      console.log('💾 Starting Save & Exit...');
      console.log('Project ID:', projectId);
      console.log('Tracks:', tracks.length);
      console.log('Socket connected:', socket?.connected);

      // ✅ STEP 1: Prepare save payload
      const savePayload = {
        name: projectData?.name || projectData?.title || 'Untitled Project',
        description: projectData?.description || '',
        bpm: projectData?.bpm || projectData?.tempo || 120,
        timeSignature: projectData?.timeSignature || '4/4',
        keySignature: projectData?.keySignature || '',
        metadata: {
          ...sessionChanges?.metadata,
          lastModified: new Date().toISOString(),
          trackCount: tracks.length,
          uploadedTracksCount: tracks.filter(t => !t.isAIGenerated && !t.title?.includes('AI')).length,
          aiTracksCount: tracks.filter(t => t.isAIGenerated || t.title?.includes('AI')).length
        }
      };

      console.log('📦 Save Payload:', savePayload);

      // ✅ STEP 2: Save to MongoDB
      const response = await api.put(
        `/collaboration/projects/${projectId}`, 
        savePayload
      );

      console.log('✅ MongoDB Save Response:', response.data);

      if (response.data && response.data.project) {
        // ✅ STEP 3: Emit Socket.IO event to notify collaborators
        if (socket && socket.connected) {
          console.log('📡 Emitting project-updated event...');
          
          socket.emit('project-updated', {
            projectId: projectId,
            updateType: 'save-and-exit',
            metadata: savePayload.metadata,
            timestamp: new Date().toISOString()
          });

          console.log('✅ Socket event emitted successfully');
        } else {
          console.warn('⚠️ Socket not connected, skipping real-time broadcast');
        }

        // ✅ STEP 4: Success notification
        toast({ 
          title: 'Project Saved Successfully!', 
          description: `Saved ${tracks.length} tracks. All collaborators will see the updates.`,
          variant: 'success' 
        });

        // ✅ STEP 5: Disconnect socket and redirect
        if (socket && socket.connected) {
          console.log('🔌 Leaving session...');
          socket.emit('leave-session', { projectId, sessionId: projectData?.sessionId });
          
          // Small delay to ensure message is sent
          await new Promise(resolve => setTimeout(resolve, 300));
          
          socket.disconnect();
          console.log('✅ Socket disconnected');
        }

        // Small delay for user feedback
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log('🏠 Redirecting to Home Page (/)');
        onClose();
        navigate('/');

      } else {
        throw new Error('Save response was empty or invalid');
      }

    } catch (error) {
      console.error('❌ Save Error:', error);
      console.error('Error Response:', error.response?.data);
      console.error('Error Status:', error.response?.status);
      
      toast({ 
        title: 'Save Failed', 
        description: error.response?.data?.error || error.message || 'Failed to save project. Please try again.',
        variant: 'error' 
      });
      
      setIsSaving(false);
    }
  };

  const handleExitWithoutSaving = () => {
    console.log('🚪 Exit Without Saving - No DB changes');
    
    // ✅ Disconnect socket without saving
    if (socket && socket.connected) {
      console.log('🔌 Leaving session without saving...');
      socket.emit('leave-session', { 
        projectId, 
        sessionId: projectData?.sessionId 
      });
      socket.disconnect();
      console.log('✅ Socket disconnected');
    }
    
    toast({ 
      title: 'Exited Without Saving', 
      description: 'No changes were saved. Other collaborators will NOT see your unsaved work.',
      variant: 'default' 
    });
    
    console.log('🏠 Redirecting to Home Page (/)');
    onClose();
    navigate('/');
  };

  // ✅ Count tracks for display
  const uploadedCount = tracks.filter(t => !t.isAIGenerated && !t.title?.includes('AI')).length;
  const aiCount = tracks.filter(t => t.isAIGenerated || t.title?.includes('AI')).length;
  const totalChanges = tracks.length;

  return (
    <div className="save-dialog-overlay">
      <div className="save-dialog-container">
        
        {/* Header */}
        <div className="save-dialog-header">
          <div className="save-dialog-icon">
            <i className="bi bi-question-circle"></i>
          </div>
          <h2 className="save-dialog-title">Save Changes Before Exiting?</h2>
          <p className="save-dialog-description">
            You have {totalChanges} track{totalChanges !== 1 ? 's' : ''} in this collaboration workspace.
          </p>
        </div>

        {/* What will be saved */}
        <div className="save-dialog-info">
          <p className="save-dialog-info-title">
            <i className="bi bi-database me-2"></i>
            Changes to be saved to MongoDB:
          </p>
          <ul className="save-dialog-info-list">
            <li>
              <i className="bi bi-music-note-beamed"></i>
              <strong>{uploadedCount}</strong> uploaded audio file{uploadedCount !== 1 ? 's' : ''}
            </li>
            <li>
              <i className="bi bi-stars"></i>
              <strong>{aiCount}</strong> AI-generated track{aiCount !== 1 ? 's' : ''}
            </li>
            <li>
              <i className="bi bi-sliders"></i>
              Session metadata (BPM: {projectData?.bpm || 120}, Time: {projectData?.timeSignature || '4/4'})
            </li>
            <li>
              <i className="bi bi-clock-history"></i>
              Timeline edits and modifications
            </li>
            <li>
              <i className="bi bi-people"></i>
              <strong>Synced with all collaborators in real-time</strong>
            </li>
          </ul>
          
          <div className="save-dialog-stats">
            <div className="save-dialog-stat">
              <strong>{totalChanges}</strong>
              <span>Total Tracks</span>
            </div>
            <div className="save-dialog-stat">
              <strong>{uploadedCount}</strong>
              <span>Uploaded</span>
            </div>
            <div className="save-dialog-stat">
              <strong>{aiCount}</strong>
              <span>AI Generated</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="save-dialog-actions">
          {/* Save & Exit */}
          <button
            onClick={handleSaveAndExit}
            disabled={isSaving}
            className="save-dialog-button save-dialog-button-primary"
          >
            {isSaving ? (
              <>
                <span className="save-dialog-spinner"></span>
                Saving to MongoDB...
              </>
            ) : (
              <>
                <i className="bi bi-check-lg"></i>
                Save & Exit
              </>
            )}
          </button>

          {/* Exit Without Saving */}
          <button
            onClick={handleExitWithoutSaving}
            disabled={isSaving}
            className="save-dialog-button save-dialog-button-danger"
          >
            <i className="bi bi-x-lg"></i>
            Exit Without Saving
          </button>

          {/* Cancel */}
          <button
            onClick={onClose}
            disabled={isSaving}
            className="save-dialog-button save-dialog-button-secondary"
          >
            <i className="bi bi-arrow-left"></i>
            Cancel
          </button>
        </div>

        {/* Warning */}
        <div className="save-dialog-warning">
          <i className="bi bi-exclamation-triangle-fill"></i>
          <span>
            <strong>Warning:</strong> Exiting without saving will discard all unsaved changes permanently. 
            Other collaborators will NOT see these changes.
          </span>
        </div>

        {/* Real-time sync note */}
        <div className="save-dialog-note">
          <i className="bi bi-info-circle-fill"></i>
          <span>
            When you save, all collaborators will see these updates <strong>immediately</strong> in their project list via Socket.IO real-time sync.
          </span>
        </div>
      </div>
    </div>
  );
};