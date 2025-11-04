require('dotenv').config();
const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const mongoose = require('mongoose');

const app = express();
const server = http.createServer(app);

// Initialize Socket.IO ONCE
const io = socketIO(server, {
  cors: {
    origin: process.env.CLIENT_URL || 'http://localhost:3000',
    methods: ['GET', 'POST'],
    credentials: true
  }
});

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/tune_together')
  .then(() => console.log('✅ MongoDB connected'))
  .catch(err => console.error('❌ MongoDB connection error:', err));

// Middleware
app.use(cors({
  origin: process.env.CLIENT_URL || 'http://localhost:3000',
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Make io available to routes
app.locals.io = io;

// Your existing routes
app.use('/api/auth', require('./routes/auth1'));
app.use('/api/ai', require('./routes/ai'));
app.use('/api/learn', require('./routes/learn'));
app.use('/api/profiles', require('./routes/profiles'));
app.use('/api/projects', require('./routes/projects'));

// NEW collaboration routes
app.use('/api/musicians', require('./routes/musicians'));
app.use('/api/collaboration/requests', require('./routes/CollaborationRequests'));
app.use('/api/collaboration/projects', require('./routes/collaborationProjects'));

// Initialize Socket Service
const socketService = require('./services/socketService');
socketService.initialize(io);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected'
  });
});

// Error handling
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal server error'
  });
});

const PORT = process.env.PORT || 5000;

server.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
  console.log(`📡 WebSocket server ready`);
  console.log(`🌐 CORS enabled for: ${process.env.CLIENT_URL || 'http://localhost:3000'}`);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, closing server...');
  server.close(() => {
    mongoose.connection.close();
    process.exit(0);
  });
});

module.exports = { app, server, io };