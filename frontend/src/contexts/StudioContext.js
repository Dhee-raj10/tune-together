// src/contexts/StudioContext.js - FIXED VERSION
import React, { createContext, useContext, useState, useRef, useEffect, useCallback } from 'react';
import { io } from 'socket.io-client';
import { toast } from '../hooks/use-toast';
import { useAuth } from './AuthContext';
import api from '../services/api';

const StudioContext = createContext();
export function useStudio() { return useContext(StudioContext); }

const socket = io('https://tune-together.onrender.com', { autoConnect: false, withCredentials: true });

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
    
    if (data.trackId) {
      setTracks(prev => prev.map(t => (t.id || t._id) === data.trackId ? { ...t, ...data.updates } : t));
    }
    
    if (data.updates.bpm || data.updates.master_volume) {
      setProjectMetadata(prev => ({ 
        ...prev, 
        tempo: data.updates.bpm || prev.tempo, 
        master_volume: data.updates.master_volume || prev.master_volume 
      }));
    }
    
    toast({ title: `${data.username} updated the project`, variant: 'default' });
  }, [user]);

  // ✅ CRITICAL FIX: Smart track loading with proper endpoint detection
  const loadTracks = useCallback(async (id, isCollaborative = false) => {
    if (!id) {
      console.log('⚠️ No project ID provided');
      return;
    }
    
    try {
      console.log('📥 Loading tracks for project:', id);
      console.log('   Type:', isCollaborative ? 'COLLABORATIVE' : 'SOLO');
      
      let res;
      
      if (isCollaborative) {
        // ✅ Collaborative projects: Use collaboration endpoint
        console.log('   Endpoint: /collaboration/projects/:id/tracks');
        res = await api.get(`/collaboration/projects/${id}/tracks`);
      } else {
        // ✅ Solo projects: Use standard projects endpoint
        console.log('   Endpoint: /projects/:id/tracks');
        res = await api.get(`/projects/${id}/tracks`);
      }
      
      const loadedTracks = res.data || [];
      console.log(`✅ Loaded ${loadedTracks.length} tracks from database`);
      
      // ✅ CRITICAL: Format tracks consistently
      const formattedTracks = loadedTracks.map(track => ({
        id: track._id || track.id,
        _id: track._id || track.id,
        title: track.title || track.name,
        name: track.name || track.title,
        file_url: track.file_url || track.audioFileUrl,
        audioFileUrl: track.audioFileUrl || track.file_url,
        duration: track.duration || 0,
        instrument: track.instrument || 'Unknown',
        isAIGenerated: track.isAIGenerated || false,
        createdAt: track.createdAt || track.created_at
      }));
      
      console.log('📊 Formatted tracks:', formattedTracks.length);
      setTracks(formattedTracks);
      
      return formattedTracks;
      
    } catch (error) {
      console.error('❌ Failed to load tracks:', error);
      console.error('   Status:', error.response?.status);
      console.error('   Message:', error.response?.data?.msg);
      
      toast({ 
        title: "Failed to load tracks", 
        description: error.response?.data?.msg || "Unable to fetch tracks.", 
        variant: 'destructive' 
      });
      
      return [];
    }
  }, []);
  
  // ✅ CRITICAL FIX: Determine project type and load accordingly
  const loadProject = useCallback(async (id) => {
    if (!id) throw new Error('Project ID is required');
    
    try {
      setProjectId(id);
      console.log('📂 Loading project:', id);
      
      let projectData = null;
      let isCollaborative = false;
      
      // ✅ STEP 1: Try collaborative first
      try {
        console.log('   Trying: /collaboration/projects/:id');
        const collabRes = await api.get(`/collaboration/projects/${id}`);
        projectData = collabRes.data.project || collabRes.data;
        isCollaborative = true;
        console.log('✅ Found as COLLABORATIVE project');
      } catch (error) {
        if (error.response?.status === 404 || error.response?.status === 403) {
          console.log('   Not a collaborative project, trying solo...');
          
          // ✅ STEP 2: Try solo project
          try {
            console.log('   Trying: /projects/:id');
            const soloRes = await api.get(`/projects/${id}`);
            projectData = soloRes.data;
            isCollaborative = false;
            console.log('✅ Found as SOLO project');
          } catch (soloError) {
            console.error('❌ Not found in solo projects either');
            throw soloError;
          }
        } else {
          throw error;
        }
      }
      
      if (!projectData) {
        throw new Error('Project data is null');
      }
      
      console.log('📊 Project data:', projectData);
      
      // ✅ STEP 3: Set metadata
      setProjectMetadata({
        title: projectData.title || projectData.name || 'Untitled Project',
        name: projectData.name || projectData.title || 'Untitled Project',
        description: projectData.description || '',
        mode: isCollaborative ? 'collaborative' : (projectData.mode || 'solo'),
        tempo: projectData.tempo || projectData.bpm || 120,
        bpm: projectData.bpm || projectData.tempo || 120,
        master_volume: projectData.master_volume || 0.8,
        owner_id: projectData.owner_id,
        collaborators: projectData.collaborators || [],
        sessionId: projectData.sessionId,
        timeSignature: projectData.timeSignature || '4/4',
        keySignature: projectData.keySignature || '',
        isCollaborative: isCollaborative
      });
      
      // ✅ CRITICAL FIX: Always load tracks from database
      console.log('⚠️ Loading tracks from database (not embedded data)');
      const loadedTracks = await loadTracks(id, isCollaborative);
      
      console.log(`✅ Successfully loaded ${loadedTracks.length} tracks from database`);
      
      return projectData;
      
    } catch (error) {
      console.error('❌ Load project error:', error);
      console.error('   Status:', error.response?.status);
      console.error('   Data:', error.response?.data);
      
      toast({ 
        title: "Failed to load project", 
        description: error.response?.data?.msg || error.message || 'Unknown error', 
        variant: 'destructive' 
      });
      
      throw error;
    }
  }, [loadTracks]);

  const connectToStudio = useCallback((id, metadata) => {
    if (!user || !metadata.sessionId) return;

    const token = localStorage.getItem('token');
    socket.auth = { token };
    
    setProjectId(id);
    setProjectMetadata(metadata);
    setCollaborators([]);
    socket.connect();
    
    socket.on('session-state', (data) => {
      console.log('📡 Received session-state:', data);
      
      // ✅ For collaborative projects, tracks from socket override local
      if (data.tracks && Array.isArray(data.tracks)) {
        console.log(`✅ Socket.IO provided ${data.tracks.length} tracks`);
        
        const formattedTracks = data.tracks.map(track => ({
          id: track._id || track.id,
          _id: track._id || track.id,
          title: track.name || track.title,
          name: track.name || track.title,
          file_url: track.audioFileUrl || track.file_url,
          audioFileUrl: track.audioFileUrl || track.file_url,
          duration: track.duration || 0,
          instrument: track.instrument || 'Unknown',
          isAIGenerated: track.isAIGenerated || false
        }));
        
        setTracks(formattedTracks);
      }
      
      setCollaborators(data.users.map(u => u.userId)); 
      setProjectMetadata(prev => ({
        ...prev, 
        bpm: data.bpm || prev.tempo, 
        timeSignature: data.timeSignature || prev.timeSignature
      }));
      
      toast({ title: 'Studio session loaded.', variant: 'success' });
    });
    
    socket.on('user-joined', (data) => {
      setCollaborators(prev => [...new Set([...prev, data.userId])]);
      toast({ title: `${data.username || 'Someone'} joined the session`, variant: 'success' });
    });
    
    socket.on('user-left', (data) => {
      setCollaborators(prev => prev.filter(uid => uid !== data.userId));
      toast({ title: `${data.username || 'Someone'} left the session`, variant: 'default' });
    });

    socket.on('track-updated', handleTrackSync);
    
    socket.on('track-added', (data) => {
      console.log('📡 Track added via Socket.IO:', data.track);
      
      const formattedTrack = {
        id: data.track._id || data.track.id,
        _id: data.track._id || data.track.id,
        title: data.track.name || data.track.title,
        name: data.track.name || data.track.title,
        file_url: data.track.audioFileUrl || data.track.file_url,
        audioFileUrl: data.track.audioFileUrl || data.track.file_url,
        duration: data.track.duration || 0,
        instrument: data.track.instrument || 'Unknown',
        isAIGenerated: data.track.isAIGenerated || false
      };
      
      setTracks(prev => [...prev, formattedTrack]);
      toast({ title: `${data.username} added a track.`, variant: 'default' });
    });
    
    socket.on('track-deleted', (data) => {
      console.log('📡 Track deleted via Socket.IO:', data.trackId);
      setTracks(prev => prev.filter(t => (t.id || t._id) !== data.trackId));
      toast({ title: `Track deleted by ${data.username}.`, variant: 'default' });
    });

    socket.emit('join-session', { projectId: id, sessionId: metadata.sessionId });
    
  }, [user, handleTrackSync, handleTransportSync]);

  const disconnectFromStudio = useCallback(() => {
    if (!projectId || !socket.connected) return;
    
    socket.emit('leave-session', { projectId, sessionId: projectMetadata.sessionId });
    
    socket.off('session-state');
    socket.off('user-joined');
    socket.off('user-left');
    socket.off('track-updated');
    socket.off('track-added');
    socket.off('track-deleted');
    
    socket.disconnect();
    setProjectId(null);
    setIsPlaying(false);
    setTracks([]);
    setProjectMetadata({});
    setCollaborators([]);
  }, [projectId, projectMetadata.sessionId]);

  const sendTrackEdit = (trackId, updates, change_type) => {
    if (!projectId || !socket.connected) return;
    
    socket.emit('track-update', { 
      projectId, 
      trackId, 
      updates, 
      change_type, 
      userId: user.id, 
      username: user.username 
    });
    handleTrackSync({ trackId, updates, userId: user.id, username: user.username });
  };

  const addTrack = useCallback((newTrack) => {
    console.log('➕ Adding track to context:', newTrack);
    
    const formattedTrack = {
      id: newTrack._id || newTrack.id,
      _id: newTrack._id || newTrack.id,
      title: newTrack.title || newTrack.name,
      name: newTrack.name || newTrack.title,
      file_url: newTrack.file_url || newTrack.audioFileUrl,
      audioFileUrl: newTrack.audioFileUrl || newTrack.file_url,
      duration: newTrack.duration || 0,
      instrument: newTrack.instrument || 'Unknown',
      isAIGenerated: newTrack.isAIGenerated || false
    };
    
    setTracks(prev => [...prev, formattedTrack]);
    
    toast({ 
      title: "Track added successfully", 
      description: `"${formattedTrack.title}" has been added to the project`, 
      variant: 'success' 
    });
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
    sendTrackEdit,
    setTracks,
    loadTracks,
    loadProject,
    addTrack,
  };

  return (
    <StudioContext.Provider value={value}>
      {children}
    </StudioContext.Provider>
  );
}