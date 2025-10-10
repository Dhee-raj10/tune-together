import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import api from '../services/api';
import { toast } from '../hooks/use-toast';
import { useAuth } from './AuthContext';

const StudioContext = createContext();
export function useStudio() { return useContext(StudioContext); }

const socket = io('http://localhost:5000', { autoConnect: false, withCredentials: true });

export function StudioProvider({ children }) {
  const { user } = useAuth();
  const [projectId, setProjectId] = useState(null);
  const [projectMetadata, setProjectMetadata] = useState({});
  const [tracks, setTracks] = useState([]);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentPlaybackTime, setCurrentPlaybackTime] = useState(0);
  const [collaborators, setCollaborators] = useState([]);
  const audioContextRef = useRef(null);

  useEffect(() => {
    if (!audioContextRef.current) {
      audioContextRef.current = new (window.AudioContext || window.webkitAudioContext)();
    }
  }, []);

  const handleTransportSync = useCallback((data) => {
    if (data.userId === user?.id) return;
    if (data.action === 'PLAY') {
      setIsPlaying(true);
      setCurrentPlaybackTime(data.time);
    } else if (data.action === 'STOP') {
      setIsPlaying(false);
    } else if (data.action === 'SEEK') {
      setCurrentPlaybackTime(data.time);
    }
  }, [user]);

  const handleTrackSync = useCallback((data) => {
    if (data.userId === user?.id) return;
    setTracks(prev => prev.map(t => t._id === data.trackId ? { ...t, ...data.changes } : t));
    if (data.change_type === 'TEMPO' || data.change_type === 'MASTER_VOLUME') {
      setProjectMetadata(prev => ({ ...prev, ...data.changes }));
    }
    toast({ title: `${data.username} updated the project`, variant: 'default' });
  }, [user]);

  const connectToStudio = useCallback((id, metadata) => {
    if (!user) return;
    setProjectId(id);
    setProjectMetadata(metadata);
    setCollaborators([]);
    socket.connect();
    socket.emit('joinProject', id, user.id);
    socket.on('transportSync', handleTransportSync);
    socket.on('trackSync', handleTrackSync);
    socket.on('collaboratorJoined', (data) => {
      setCollaborators(prev => [...new Set([...prev, data.userId])]);
      toast({ title: `${data.username || 'Someone'} joined the session`, variant: 'success' });
    });
    socket.on('collaboratorLeft', (data) => {
      setCollaborators(prev => prev.filter(id => id !== data.userId));
      toast({ title: `${data.username || 'Someone'} left the session`, variant: 'default' });
    });
  }, [user, handleTransportSync, handleTrackSync]);

  const disconnectFromStudio = useCallback(() => {
    if (!projectId) return;
    socket.emit('leaveProject', projectId, user?.id);
    socket.off('transportSync', handleTransportSync);
    socket.off('trackSync', handleTrackSync);
    socket.off('collaboratorJoined');
    socket.off('collaboratorLeft');
    socket.disconnect();
    setProjectId(null);
    setIsPlaying(false);
    setTracks([]);
    setProjectMetadata({});
    setCollaborators([]);
  }, [projectId, user, handleTransportSync, handleTrackSync]);

  const sendTransportAction = (action, time = 0) => {
    if (!projectId) return;
    socket.emit('transportUpdate', { projectId, action, time, userId: user.id, username: user.username });
  };

  const sendTrackEdit = (trackId, changes, change_type) => {
    if (!projectId) return;
    socket.emit('trackEdit', { projectId, trackId, change_type, changes, userId: user.id, username: user.username });
  };

  const loadTracks = useCallback(async (id) => {
    if (!id) return;
    try {
      const res = await api.get(`/projects/${id}/tracks`);
      setTracks(res.data || []);
    } catch (error) {
      toast({ title: "Failed to load tracks", description: error.response?.data?.msg || "Unable to fetch tracks.", variant: 'destructive' });
    }
  }, []);

  const loadProject = useCallback(async (id) => {
    if (!id) throw new Error('Project ID is required');
    try {
      const res = await api.get(`/projects/${id}`);
      const projectData = res.data;
      setProjectMetadata({
        title: projectData.title || 'Untitled Project',
        description: projectData.description || '',
        mode: projectData.mode || 'solo',
        tempo: projectData.tempo || 120,
        master_volume: projectData.master_volume || 0.8,
        owner_id: projectData.owner_id,
        collaborators: projectData.collaborators || []
      });
      if (projectData.tracks) {
        setTracks(projectData.tracks);
      } else {
        await loadTracks(id);
      }
      return projectData;
    } catch (error) {
      toast({ title: "Failed to load project", description: error.response?.data?.msg || error.message || 'Unknown error', variant: 'destructive' });
      throw error;
    }
  }, [loadTracks]);

  const addTrack = useCallback((newTrack) => {
    setTracks(prev => [...prev, newTrack]);
    toast({ title: "Track added successfully", description: `"${newTrack.title}" has been added to the project`, variant: 'success' });
  }, []);

  const value = {
    projectId,
    projectMetadata,
    tracks,
    isPlaying,
    currentPlaybackTime,
    collaborators,
    audioContext: audioContextRef.current,
    socket,
    connectToStudio,
    disconnectFromStudio,
    sendTransportAction,
    sendTrackEdit,
    setTracks,
    loadTracks,
    loadProject, // <-- Do not remove!
    addTrack,
  };

  return (
    <StudioContext.Provider value={value}>
      {children}
    </StudioContext.Provider>
  );
}
