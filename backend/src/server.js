import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import mongoose from 'mongoose';
import helmet from 'helmet';
import mongoSanitize from 'express-mongo-sanitize';

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
import { generalLimiter, authLimiter, publicLimiter, bookingLimiter } from './middleware/rateLimiter.js';
import { initializeCronJobs } from './services/cronService.js';
import logger from './config/logger.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Load environment variables
dotenv.config({ path: join(__dirname, '../.env') });

const app = express();
const PORT = process.env.PORT || 8001;

// Security Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com"],
      imgSrc: ["'self'", "data:", "https:", "http:"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      connectSrc: ["'self'", "https:", "wss:"],
    },
  },
  crossOriginEmbedderPolicy: false, // Allow widget embedding
}));

// Data sanitization against NoSQL injection
app.use(mongoSanitize({
  replaceWith: '_',
  onSanitize: ({ req, key }) => {
    logger.warn(`MongoDB injection attempt detected`, { 
      ip: req.ip, 
      key, 
      path: req.path 
    });
  }
}));

// Apply general rate limiting to all routes
app.use('/api', generalLimiter);

// Core Middleware
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
    logger.info('✅ Connected to MongoDB', { database: DB_NAME });
    
    // Initialize cron jobs after DB connection
    initializeCronJobs();
  })
  .catch((err) => {
    logger.error('❌ MongoDB connection error', { error: err.message });
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

// API Routes with specific rate limiters
app.use('/api/auth', authLimiter, authRoutes);
app.use('/api/hotel', hotelRoutes);
app.use('/api/rooms', roomRoutes);
app.use('/api/wallets', walletRoutes);
app.use('/api/widget', bookingLimiter, widgetRoutes);
app.use('/api/stats', statsRoutes);
app.use('/api/mcp', mcpRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/marketplace', marketplaceRoutes);
app.use('/api/bookings', bookingsRoutes);
app.use('/api/guest', guestRoutes);
app.use('/api/password', authLimiter, passwordRoutes);
app.use('/api/billing', billingRoutes);
app.use('/api/public', publicLimiter, publicRoutes);

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
  logger.info('🚀 Bitsy SaaS Backend Started', {
    port: PORT,
    environment: process.env.NODE_ENV || 'development',
    apiPrefix: '/api'
  });
  console.log(`\n🚀 Bitsy SaaS Backend`);
  console.log(`   Server running on http://0.0.0.0:${PORT}`);
  console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`\n`);
});

export default app;
