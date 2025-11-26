// backend/services/socketService.js - FIXED VERSION
const jwt = require('jsonwebtoken');
const config = require('../config/default');
const CollaborationProject = require('../models/CollaborationProject');

class SocketService {
  constructor() {
    this.sessions = new Map();
    this.userSockets = new Map();
  }

  initialize(io) {
    this.io = io;

    io.use((socket, next) => {
      try {
        const token = socket.handshake.auth.token;
        if (!token) {
          return next(new Error('Authentication required'));
        }

        const decoded = jwt.verify(token, config.jwtSecret);
        socket.userId = decoded.user?.id || decoded.userId || decoded.id;
        socket.username = decoded.user?.username || decoded.username;
        next();
      } catch (error) {
        next(new Error('Invalid token'));
      }
    });

    io.on('connection', (socket) => {
      console.log('✅ User connected:', socket.username || socket.userId);
      this.userSockets.set(socket.userId, socket.id);

      this.setupEventHandlers(socket);
    });

    console.log('✅ Collaboration WebSocket service initialized');
  }

  setupEventHandlers(socket) {
    socket.on('join-session', (data) => this.handleJoinSession(socket, data));
    socket.on('leave-session', (data) => this.handleLeaveSession(socket, data));
    socket.on('track-add', (data) => this.handleTrackAdd(socket, data));
    socket.on('track-update', (data) => this.handleTrackUpdate(socket, data));
    socket.on('track-delete', (data) => this.handleTrackDelete(socket, data));
    socket.on('project-updated', (data) => {
      console.log('📡 Broadcasting project-updated:', data);
      socket.to(data.projectId).emit('project-updated', {
        projectId: data.projectId,
        updateType: data.updateType,
        metadata: data.metadata,
        timestamp: data.timestamp,
        updatedBy: socket.username || socket.userId,
      });
    });

    socket.on('disconnect', () => this.handleDisconnect(socket));
  }

  async handleJoinSession(socket, { projectId, sessionId }) {
    try {
      console.log('🔗 User joining session:', socket.username);
      console.log('   Project ID:', projectId);
      console.log('   Session ID:', sessionId);

      const project = await CollaborationProject.findById(projectId)
        .populate('collaborators.userId', 'username avatar_url');

      if (!project) {
        console.log('❌ Project not found');
        socket.emit('error', { message: 'Project not found' });
        return;
      }

      const hasAccess = project.collaborators.some(
        (c) => c.userId && c.userId._id.toString() === socket.userId.toString()
      );

      if (!hasAccess) {
        console.log('❌ Access denied');
        socket.emit('error', { message: 'Access denied' });
        return;
      }

      socket.join(sessionId);
      socket.projectId = projectId;
      socket.sessionId = sessionId;

      if (!this.sessions.has(sessionId)) {
        console.log('📦 Creating new session in memory');
        this.sessions.set(sessionId, {
          projectId,
          projectName: project.name,
          users: [],
          tracks: project.tracks || [], // ✅ Load tracks from MongoDB
          bpm: project.bpm,
          timeSignature: project.timeSignature,
          locks: new Map(),
        });
      }

      const session = this.sessions.get(sessionId);
      
      // ✅ CRITICAL: Reload tracks from MongoDB to ensure latest data
      const latestProject = await CollaborationProject.findById(projectId);
      session.tracks = latestProject.tracks || [];
      
      console.log(`📊 Session has ${session.tracks.length} tracks from MongoDB`);

      const userColor = `hsl(${Math.floor(Math.random() * 360)}, 70%, 60%)`;

      session.users.push({
        userId: socket.userId,
        username: socket.username,
        socketId: socket.id,
        color: userColor,
      });

      await CollaborationProject.findOneAndUpdate(
        { _id: projectId, 'collaborators.userId': socket.userId },
        { $set: { 'collaborators.$.lastActive': new Date() } }
      );

      // ✅ Send current session state with tracks
      socket.emit('session-state', {
        projectId: session.projectId,
        projectName: session.projectName,
        users: session.users,
        tracks: session.tracks, // ✅ This will be received by frontend
        bpm: session.bpm,
        timeSignature: session.timeSignature,
        locks: Array.from(session.locks.entries()),
      });

      socket.to(sessionId).emit('user-joined', {
        userId: socket.userId,
        username: socket.username,
        color: userColor,
      });

      console.log(`✅ ${socket.username} joined session with ${session.tracks.length} tracks`);
    } catch (error) {
      console.error('❌ Join session error:', error);
      socket.emit('error', { message: error.message });
    }
  }

  async handleTrackAdd(socket, { trackData }) {
    try {
      const { sessionId, projectId } = socket;
      if (!sessionId || !projectId) return;

      const session = this.sessions.get(sessionId);
      if (!session) return;

      console.log('➕ Adding track via Socket.IO:', trackData.name);

      const project = await CollaborationProject.findById(projectId);
      const newTrack = {
        name: trackData.name,
        instrument: trackData.instrument,
        createdBy: socket.userId,
        audioFileUrl: trackData.audioFileUrl,
        notes: trackData.notes || [],
        trackOrder: project.tracks.length,
        duration: trackData.duration || 0,
        isAIGenerated: trackData.isAIGenerated || false,
      };

      project.tracks.push(newTrack);
      await project.save();

      const savedTrack = project.tracks[project.tracks.length - 1];
      
      // ✅ Update session memory
      session.tracks.push(savedTrack);

      console.log(`✅ Track saved to MongoDB: ${savedTrack._id}`);

      // ✅ Broadcast to all users in session
      this.io.to(sessionId).emit('track-added', {
        track: savedTrack,
        addedBy: socket.userId,
        username: socket.username,
      });
    } catch (error) {
      console.error('❌ Track add error:', error);
      socket.emit('error', { message: error.message });
    }
  }

  async handleTrackUpdate(socket, { trackId, updates }) {
    try {
      const { sessionId, projectId } = socket;
      if (!sessionId) return;

      const session = this.sessions.get(sessionId);
      if (!session) return;

      console.log('✏️ Updating track:', trackId);

      // ✅ Update in MongoDB
      await CollaborationProject.findOneAndUpdate(
        { _id: projectId, 'tracks._id': trackId },
        {
          $set: Object.keys(updates).reduce((acc, key) => {
            acc[`tracks.$.${key}`] = updates[key];
            return acc;
          }, {}),
        }
      );

      // ✅ Update session memory
      const trackIndex = session.tracks.findIndex(
        (t) => t._id.toString() === trackId
      );
      if (trackIndex !== -1) {
        session.tracks[trackIndex] = {
          ...session.tracks[trackIndex],
          ...updates,
        };
      }

      console.log('✅ Track updated in MongoDB');

      // ✅ Broadcast to other users
      socket.to(sessionId).emit('track-updated', {
        trackId,
        updates,
        updatedBy: socket.userId,
        username: socket.username,
      });
    } catch (error) {
      console.error('❌ Track update error:', error);
      socket.emit('error', { message: error.message });
    }
  }

  async handleTrackDelete(socket, { trackId }) {
    try {
      const { sessionId, projectId } = socket;
      if (!sessionId) return;

      const session = this.sessions.get(sessionId);
      if (!session) return;

      console.log('🗑️ Deleting track:', trackId);

      // ✅ Delete from MongoDB
      await CollaborationProject.findByIdAndUpdate(projectId, {
        $pull: { tracks: { _id: trackId } },
      });

      // ✅ Update session memory
      session.tracks = session.tracks.filter(
        (t) => t._id.toString() !== trackId
      );
      session.locks.delete(trackId);

      console.log('✅ Track deleted from MongoDB');

      // ✅ Broadcast to all users
      this.io.to(sessionId).emit('track-deleted', {
        trackId,
        deletedBy: socket.userId,
      });
    } catch (error) {
      console.error('❌ Track delete error:', error);
      socket.emit('error', { message: error.message });
    }
  }

  handleLeaveSession(socket) {
    const { sessionId } = socket;
    if (!sessionId) return;

    const session = this.sessions.get(sessionId);
    if (!session) return;

    console.log(`👋 ${socket.username} leaving session`);

    session.users = session.users.filter((u) => u.userId !== socket.userId);

    socket.to(sessionId).emit('user-left', {
      userId: socket.userId,
      username: socket.username,
    });

    // ✅ Don't delete session immediately - keep tracks in memory
    // Session will be recreated with fresh data on next join

    socket.leave(sessionId);
  }

  handleDisconnect(socket) {
    console.log('❌ User disconnected:', socket.username || socket.userId);
    this.userSockets.delete(socket.userId);
    this.handleLeaveSession(socket, {});
  }
}

module.exports = new SocketService();