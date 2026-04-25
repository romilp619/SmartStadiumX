require('dotenv').config();
const express = require('express');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');
const { connectDB } = require('./config/db');
const errorHandler = require('./middleware/errorHandler');

// Routes
const authRoutes = require('./routes/auth');
const ticketRoutes = require('./routes/tickets');
const zoneRoutes = require('./routes/zones');
const stallRoutes = require('./routes/stalls');
const orderRoutes = require('./routes/orders');
const alertRoutes = require('./routes/alerts');
const rewardRoutes = require('./routes/rewards');
const analyticsRoutes = require('./routes/analytics');
const cricketRoutes = require('./routes/cricket');

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST', 'PUT', 'DELETE'] }
});

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Attach io to requests
app.use((req, res, next) => { req.io = io; next(); });

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/tickets', ticketRoutes);
app.use('/api/zones', zoneRoutes);
app.use('/api/stalls', stallRoutes);
app.use('/api/orders', orderRoutes);
app.use('/api/alerts', alertRoutes);
app.use('/api/rewards', rewardRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/cricket', cricketRoutes);

app.get('/api/health', (req, res) => res.json({ status: 'ok', message: 'SmartStadiumX API Running 🏟️' }));

// Serve React frontend in production
const path = require('path');
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'public')));
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
  });
}

// Socket.IO
io.on('connection', (socket) => {
  console.log(`🔌 Client connected: ${socket.id}`);

  socket.on('join:user', (userId) => {
    socket.join(`user:${userId}`);
    console.log(`User ${userId} joined their room`);
  });

  socket.on('join:stall', (stallId) => {
    socket.join(`stall:${stallId}`);
    console.log(`Joined stall room: ${stallId}`);
  });

  socket.on('zone:simulate', (data) => {
    // Simulate crowd movement
    io.emit('zone:update', data);
  });

  socket.on('disconnect', () => {
    console.log(`🔌 Client disconnected: ${socket.id}`);
  });
});

// Error Handler
app.use(errorHandler);

const PORT = process.env.PORT || 5000;

const start = async () => {
  // ✅ Listen FIRST so Cloud Run health check passes immediately
  server.listen(PORT, () => {
    console.log(`🚀 SmartStadiumX Server running on port ${PORT}`);
    console.log(`🏟️  API: http://localhost:${PORT}/api/health`);
  });

  // Connect to MongoDB after server is already listening
  try {
    await connectDB();

    // Auto-seed on first run
    const User = require('./models/User');
    const count = await User.countDocuments();
    if (count === 0) {
      console.log('🌱 No data found, running seed...');
      require('./utils/seed')();
    }
  } catch (err) {
    console.error('❌ DB connection failed:', err.message);
    // Server keeps running even if DB fails (API health check still works)
  }
};

start();
