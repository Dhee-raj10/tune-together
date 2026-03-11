require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const server = http.createServer(app);

// CORS Configuration
app.use(cors({
  origin: process.env.CLIENT_URL || 'https://tune-together-10.onrender.com',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'x-auth-token', 'Authorization']
}));

// Socket.IO Configuration
const io = socketIO(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'https://tune-together-10.onrender.com',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// MongoDB Connection
//const mongoose = require("mongoose");

mongoose.connect(process.env.MONGODB_URI)
.then(() => {
  console.log("✅ MongoDB connected");
})
.catch((err) => {
  console.log("❌ MongoDB error:", err);
});

// Body Parser Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files (uploaded tracks)
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Make io available to routes
app.locals.io = io;

// Routes
// ✅ Auth & User
app.use('/api/auth', require('./routes/auth1'));
app.use('/api/profiles', require('./routes/profiles'));

// ✅ AI & Learning
app.use('/api/ai', require('./routes/ai'));
app.use('/api/learn', require('./routes/learn'));

// ✅ Musicians / Find Collaborators
app.use('/api/musicians', require('./routes/musicians'));

// ✅ Projects & Tracks
app.use('/api/projects', require('./routes/projects'));
app.use('/api/projects', require('./routes/tracks')); // track uploads within project

// ✅ Collaboration Requests & Project Workspace
app.use('/api/collaboration/requests', require('./routes/CollaborationRequests'));
app.use('/api/collaboration/projects', require('./routes/collaborationProjects'));
app.use('/api/collaboration/projects', require('./routes/collaborationTracks')); // tracks inside collab workspace


// Initialize Socket Service
const socketService = require('./services/socketService');
socketService.initialize(io);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Server Error:', err);
  res.status(500).json({ 
    msg: 'Server error', 
    error: process.env.NODE_ENV === 'production' ? {} : err.message 
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 WebSocket server ready`);
  console.log(`🌍 CORS enabled for: ${process.env.CLIENT_URL || 'https://tune-together-10.onrender.com'}`);
  console.log(`📁 Serving uploads from: ${path.join(__dirname, 'uploads')}`);
});

module.exports = { app, server, io };
