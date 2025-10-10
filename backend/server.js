const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
const config = require('./config/default'); 

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST", "PUT", "DELETE"] 
  }
});

app.use(cors());
app.use(express.json());

// CRITICAL: Serve static files (audio tracks)
app.use('/uploads', express.static('uploads')); 

// Connect to MongoDB
mongoose.connect(config.mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
}).then(() => console.log('MongoDB connected successfully'))
  .catch(err => console.error('MongoDB connection error:', err));

// API Routes
const authRoutes = require('./routes/auth1'); // Assuming your auth routes are in auth1.js
const projectRoutes = require('./routes/projects');
const profileRoutes = require('./routes/profiles');
const aiRoutes = require('./routes/ai'); 
const learnRoutes = require('./routes/learn'); 
const collaborationRoutes = require('./routes/collaboration'); 

app.use('/api/auth', authRoutes);     
app.use('/api/projects', projectRoutes);
app.use('/api/profiles', profileRoutes);
app.use('/api/ai', aiRoutes); 
app.use('/api/learn', learnRoutes); 
app.use('/api/collaboration', collaborationRoutes);

// Socket.IO for Real-Time Collaboration (Module 2)
io.on('connection', (socket) => {
  console.log(`User connected: ${socket.id}`);

  socket.on('joinProject', (projectId, userId) => {
    socket.join(projectId);
    console.log(`User ${userId} joined project room: ${projectId}`);
    io.to(projectId).emit('collaboratorJoined', { userId, socketId: socket.id });
  });
  
  // Real-Time DAW Synchronization
  socket.on('transportUpdate', (data) => {
    socket.to(data.projectId).emit('transportSync', data); 
  });
  
  socket.on('trackEdit', (data) => {
    socket.to(data.projectId).emit('trackSync', data);
  });
  
  socket.on('playheadPosition', (data) => {
    socket.to(data.projectId).volatile.emit('playheadSync', data); 
  });

  socket.on('disconnect', () => {
    console.log(`User disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));