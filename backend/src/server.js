import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import mongoose from 'mongoose';

// Routes
import authRoutes from './routes/auth.js';
import hotelRoutes from './routes/hotel.js';
import roomRoutes from './routes/room.js';
import walletRoutes from './routes/wallet.js';
import widgetRoutes from './routes/widget.js';
import statsRoutes from './routes/stats.js';
import { errorHandler } from './middleware/errorHandler.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 8001;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGINS?.split(',') || '*',
  credentials: true
}));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Static files for widget with proper mime types
app.use('/widget', express.static(join(__dirname, '../public/widget'), {
  setHeaders: (res, path) => {
    if (path.endsWith('.js')) {
      res.setHeader('Content-Type', 'application/javascript; charset=UTF-8');
    }
  }
}));

// MongoDB Connection
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'bitsy_saas';

mongoose.connect(`${MONGO_URL}/${DB_NAME}`)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    console.log(`   Database: ${DB_NAME}`);
  })
  .catch((err) => {
    console.error('❌ MongoDB connection error:', err);
    process.exit(1);
  });

// Health check
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    service: 'Bitsy SaaS API',
    timestamp: new Date().toISOString()
  });
});

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/hotel', hotelRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/wallets', walletRoutes);
app.use('/api/widget', widgetRoutes);
app.use('/api/stats', statsRoutes);

// Root route
app.get('/api', (req, res) => {
  res.json({ 
    message: 'Bitsy SaaS API',
    version: '1.0.0'
  });
});

// Error handler (must be last)
app.use(errorHandler);

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`\n🚀 Bitsy SaaS Backend`);
  console.log(`   Server running on http://0.0.0.0:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`   API Prefix: /api`);
  console.log(`\n📡 Available Routes:`);
  console.log(`   POST /api/auth/register`);
  console.log(`   POST /api/auth/login`);
  console.log(`   GET  /api/hotel/settings`);
  console.log(`   GET  /api/widget/:hotelId/config`);
  console.log(`   POST /api/widget/:hotelId/chat`);
  console.log(`   POST /api/widget/:hotelId/book`);
  console.log(`\n`);
});

export default app;
