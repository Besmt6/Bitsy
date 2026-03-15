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
import mcpRoutes from './routes/mcp.js';
import uploadRoutes from './routes/upload.js';
import analyticsRoutes from './routes/analytics.js';
import marketplaceRoutes from './routes/marketplace.js';
import bookingsRoutes from './routes/bookings.js';
import guestRoutes from './routes/guest.js';
import passwordRoutes from './routes/password.js';
import billingRoutes from './routes/billing.js';
import publicRoutes from './routes/public.js';
import { errorHandler } from './middleware/errorHandler.js';
import { initializeCronJobs } from './services/cronService.js';

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

// Static files for uploads
app.use('/uploads', express.static(join(__dirname, '../public/uploads')));

// Static files for demo assets
app.use('/demo-assets', express.static(join(__dirname, '../public/demo-assets')));

// Static files for videos
// Serve static files with proper headers for video streaming
app.use('/api/videos', (req, res, next) => {
  res.setHeader('Accept-Ranges', 'bytes');
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
}, express.static(join(__dirname, '../public/videos'), {
  maxAge: '1d',
  setHeaders: (res, path) => {
    if (path.endsWith('.mp4')) {
      res.setHeader('Content-Type', 'video/mp4');
    }
  }
}));

// Serve widget test page
app.get('/widget-test.html', (req, res) => {
  res.sendFile(join(__dirname, '../public/widget-test.html'));
});


// MongoDB Connection
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017';
const DB_NAME = process.env.DB_NAME || 'bitsy_saas';

mongoose.connect(`${MONGO_URL}/${DB_NAME}`)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    console.log(`   Database: ${DB_NAME}`);
    
    // Initialize cron jobs after DB connection
    initializeCronJobs();
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
app.use('/api/mcp', mcpRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/guest', guestRoutes);
app.use('/api/password', passwordRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/public', publicRoutes);

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
