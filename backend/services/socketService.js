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

    // ✅ Authentication middleware
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
    socket.on('lock-track', (data) => this.handleLockTrack(socket, data));
    socket.on('unlock-track', (data) => this.handleUnlockTrack(socket, data));
    socket.on('play-state', (data) => this.handlePlayState(socket, data));
    socket.on('cursor-position', (data) => this.handleCursorPosition(socket, data));

    // ✅ NEW: Broadcast project updates
    socket.on('project-updated', (data) => {
      console.log('📡 Broadcasting project-updated:', data);

      // Broadcast to all users in the same project/session EXCEPT the sender
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
      const project = await CollaborationProject.findById(projectId)
        .populate('collaborators.userId', 'username avatar_url');

      if (!project) {
        socket.emit('error', { message: 'Project not found' });
        return;
      }

      const hasAccess = project.collaborators.some(
        (c) => c.userId && c.userId._id.toString() === socket.userId.toString()
      );

      if (!hasAccess) {
        socket.emit('error', { message: 'Access denied' });
        return;
      }

      socket.join(sessionId);
      socket.projectId = projectId;
      socket.sessionId = sessionId;

      if (!this.sessions.has(sessionId)) {
        this.sessions.set(sessionId, {
          projectId,
          projectName: project.name,
          users: [],
          tracks: project.tracks || [],
          bpm: project.bpm,
          timeSignature: project.timeSignature,
          locks: new Map(),
        });
      }

      const session = this.sessions.get(sessionId);
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

      socket.emit('session-state', {
        ...session,
        locks: Array.from(session.locks.entries()),
      });

      socket.to(sessionId).emit('user-joined', {
        userId: socket.userId,
        username: socket.username,
        color: userColor,
      });

      console.log(`${socket.username} joined session ${sessionId}`);
    } catch (error) {
      console.error('Join session error:', error);
      socket.emit('error', { message: error.message });
    }
  }

  async handleTrackAdd(socket, { trackData }) {
    try {
      const { sessionId, projectId } = socket;
      if (!sessionId || !projectId) return;

      const session = this.sessions.get(sessionId);
      if (!session) return;

      const project = await CollaborationProject.findById(projectId);
      const newTrack = {
        name: trackData.name,
        instrument: trackData.instrument,
        createdBy: socket.userId,
        notes: trackData.notes || [],
        trackOrder: project.tracks.length,
      };

      project.tracks.push(newTrack);
      await project.save();

      const savedTrack = project.tracks[project.tracks.length - 1];
      session.tracks.push(savedTrack);

      this.io.to(sessionId).emit('track-added', {
        track: savedTrack,
        addedBy: socket.userId,
        username: socket.username,
      });
    } catch (error) {
      console.error('Track add error:', error);
      socket.emit('error', { message: error.message });
    }
  }

  async handleTrackUpdate(socket, { trackId, updates }) {
    try {
      const { sessionId, projectId } = socket;
      if (!sessionId) return;

      const session = this.sessions.get(sessionId);
      if (!session) return;

      const lock = session.locks.get(trackId);
      if (lock && lock.userId !== socket.userId) {
        socket.emit('error', {
          message: 'Track is locked',
          lockedBy: lock.username,
        });
        return;
      }

      await CollaborationProject.findOneAndUpdate(
        { _id: projectId, 'tracks._id': trackId },
        {
          $set: Object.keys(updates).reduce((acc, key) => {
            acc[`tracks.$.${key}`] = updates[key];
            return acc;
          }, {}),
        }
      );

      const trackIndex = session.tracks.findIndex(
        (t) => t._id.toString() === trackId
      );
      if (trackIndex !== -1) {
        session.tracks[trackIndex] = {
          ...session.tracks[trackIndex],
          ...updates,
        };
      }

      socket.to(sessionId).emit('track-updated', {
        trackId,
        updates,
        updatedBy: socket.userId,
        username: socket.username,
      });
    } catch (error) {
      console.error('Track update error:', error);
      socket.emit('error', { message: error.message });
    }
  }

  async handleTrackDelete(socket, { trackId }) {
    try {
      const { sessionId, projectId } = socket;
      if (!sessionId) return;

      const session = this.sessions.get(sessionId);
      if (!session) return;

      await CollaborationProject.findByIdAndUpdate(projectId, {
        $pull: { tracks: { _id: trackId } },
      });

      session.tracks = session.tracks.filter(
        (t) => t._id.toString() !== trackId
      );
      session.locks.delete(trackId);

      this.io.to(sessionId).emit('track-deleted', {
        trackId,
        deletedBy: socket.userId,
      });
    } catch (error) {
      console.error('Track delete error:', error);
      socket.emit('error', { message: error.message });
    }
  }

  handleLockTrack(socket, { trackId }) {
    const { sessionId } = socket;
    if (!sessionId) return;

    const session = this.sessions.get(sessionId);
    if (!session) return;

    const existingLock = session.locks.get(trackId);
    if (existingLock && existingLock.userId !== socket.userId) {
      socket.emit('error', {
        message: 'Track already locked',
        lockedBy: existingLock.username,
      });
      return;
    }

    session.locks.set(trackId, {
      userId: socket.userId,
      username: socket.username,
    });

    this.io.to(sessionId).emit('track-locked', {
      trackId,
      userId: socket.userId,
      username: socket.username,
    });
  }

  handleUnlockTrack(socket, { trackId }) {
    const { sessionId } = socket;
    if (!sessionId) return;

    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.locks.delete(trackId);

    this.io.to(sessionId).emit('track-unlocked', {
      trackId,
      userId: socket.userId,
    });
  }

  handlePlayState(socket, { isPlaying }) {
    const { sessionId } = socket;
    if (!sessionId) return;

    socket.to(sessionId).emit('play-state-changed', {
      isPlaying,
      userId: socket.userId,
      username: socket.username,
    });
  }

  handleCursorPosition(socket, { position }) {
    const { sessionId } = socket;
    if (!sessionId) return;

    socket.to(sessionId).emit('user-cursor', {
      userId: socket.userId,
      username: socket.username,
      position,
    });
  }

  handleLeaveSession(socket) {
    const { sessionId } = socket;
    if (!sessionId) return;

    const session = this.sessions.get(sessionId);
    if (!session) return;

    session.users = session.users.filter((u) => u.userId !== socket.userId);

    for (const [trackId, lock] of session.locks.entries()) {
      if (lock.userId === socket.userId) {
        session.locks.delete(trackId);
        this.io.to(sessionId).emit('track-unlocked', { trackId });
      }
    }

    socket.to(sessionId).emit('user-left', {
      userId: socket.userId,
      username: socket.username,
    });

    if (session.users.length === 0) {
      this.sessions.delete(sessionId);
    }

    socket.leave(sessionId);
  }

  handleDisconnect(socket) {
    console.log('❌ User disconnected:', socket.username || socket.userId);
    this.userSockets.delete(socket.userId);
    this.handleLeaveSession(socket, {});
  }
}

module.exports = new SocketService();
