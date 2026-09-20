import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
import dotenv from 'dotenv';
import mongoose from 'mongoose';

import path from 'path';

import authRoutes from './routes/auth';
import workspaceRoutes from './routes/workspace';
import analyticsRoutes from './routes/analytics';
import historyRoutes from './routes/history';
import { setupSocketHandlers } from './socket/socketHandler';

dotenv.config();

const app = express();
const server = http.createServer(app);
const PORT = process.env.PORT || 5000;

// Enable CORS for client
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());

// REST Routes
app.use('/api/auth', authRoutes);
app.use('/api/workspace', workspaceRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/history', historyRoutes);

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', serverTime: new Date().toISOString(), dbMode: 'Hybrid In-Memory/Mongo' });
});

// Socket.io initialization
const io = new Server(server, {
  cors: {
    origin: '*',
    methods: ['GET', 'POST']
  }
});

setupSocketHandlers(io);

// Serve client static build files if present
const clientDistPath = path.join(__dirname, '../../client/dist');
app.use(express.static(clientDistPath));

app.get('*', (req, res, next) => {
  if (req.path.startsWith('/api') || req.path.startsWith('/socket.io')) {
    return next();
  }
  res.sendFile(path.join(clientDistPath, 'index.html'), (err) => {
    if (err) {
      res.status(404).send(`Cannot GET ${req.path}. (Frontend dev server runs at http://localhost:3000)`);
    }
  });
});

// Optional MongoDB Connection with graceful failover
const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/collabsync';
mongoose.connect(MONGO_URI)
  .then(() => console.log('[MongoDB] Connected successfully to Database'))
  .catch(err => console.log('[MongoDB] Standalone Mongo unavailable - running seamlessly with Embedded In-Memory Store'));

server.listen(PORT, () => {
  console.log(`[CollabSync Server] Listening on http://localhost:${PORT}`);
});
