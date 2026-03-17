import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import compression from 'compression';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { DB_OPTIMIZATION, createIndexes, monitorPerformance } from './config/database';

// Import routes
import authRoutes from './routes/auth';
import userRoutes from './routes/users';
import resolutionRoutes from './routes/resolutions';
import ordinanceRoutes from './routes/ordinances';
import procurementRoutes from './routes/procurements';
import budgetRoutes from './routes/budgets';
import vacancyRoutes from './routes/vacancies';
import applicationRoutes from './routes/applications';
import announcementRoutes from './routes/announcements';
import systemRoutes from './routes/system';
import settingsRoutes from './routes/settings';
import templateRoutes from './routes/templates';
import activityRoutes from './routes/activities';
import complaintRoutes from './routes/complaints';
import bidAwardRoutes from './routes/bidawards';
import cdnRoutes from './middleware/cdn';
import healthRoutes from './routes/health';

// Load environment variables from parent directory
dotenv.config({ path: '../.env' });

const app = express();
const PORT = process.env.SERVER_PORT || 5000;

// Performance middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" }
}));
app.use(compression());

// Rate limiting for API protection
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // Limit each IP to 1000 requests per windowMs
  message: 'Too many requests from this IP, please try again later.',
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter);

// Enhanced CORS with caching
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://127.0.0.1:3000',
    'http://10.18.110.103:3000',
    'http://192.168.56.1:3000',
    'http://172.18.80.1:3000',
    /^https:\/\/.*-3000\.asse\.devtunnels\.ms$/, // Allow any dev tunnel on port 3000
    /^https:\/\/.*\.loca\.lt$/, // Allow localtunnel
    /^https:\/\/.*\.ngrok\.io$/, // Allow ngrok
    /^https:\/\/.*\.ngrok-free\.app$/ // Allow ngrok free
  ],
  credentials: true,
  maxAge: 86400 // Cache preflight for 24 hours
}));

// Body parsing with increased limits for performance
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static file serving with caching
app.use('/uploads', express.static(path.join(__dirname, 'uploads'), {
  maxAge: '1d', // Cache files for 1 day
  etag: true,
  lastModified: true,
  setHeaders: (res, path) => {
    if (path.endsWith('.mp4') || path.endsWith('.avi') || path.endsWith('.mov') || 
        path.endsWith('.wmv') || path.endsWith('.flv') || path.endsWith('.webm') || path.endsWith('.mkv')) {
      res.set('Content-Type', 'video/mp4');
    }
  }
}));

// Response time monitoring
app.use((req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`⏱️ ${req.method} ${req.originalUrl} - ${res.statusCode} - ${duration}ms`);
  });
  
  next();
});

// CDN routes
app.use('/cdn', cdnRoutes);

// Health check routes
app.use('/api', healthRoutes);

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/resolutions', resolutionRoutes);
app.use('/api/ordinances', ordinanceRoutes);
app.use('/api/procurements', procurementRoutes);
app.use('/api/budgets', budgetRoutes);
app.use('/api/vacancies', vacancyRoutes);
app.use('/api/applications', applicationRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/system', systemRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/templates', templateRoutes);
app.use('/api/activities', activityRoutes);
app.use('/api/complaints', complaintRoutes);
app.use('/api/bidawards', bidAwardRoutes);

// Database connection
console.log('Attempting to connect to MongoDB...');
monitorPerformance();

mongoose.connect(process.env.MONGODB_URI || '', DB_OPTIMIZATION)
  .then(async () => {
    console.log('Connected to MongoDB Atlas');
    
    // Create database indexes for optimal performance
    await createIndexes();
    
    console.log(`Starting server on port ${PORT}...`);
    const HOST = '0.0.0.0'; // Allow network access
    const portNumber = Number(PORT);
    app.listen(portNumber, HOST, () => {
      console.log(`Server is running on http://${HOST}:${PORT}`);
      console.log(`Local access: http://localhost:${PORT}`);
      console.log(`Network access: http://10.18.110.103:${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Database connection error:', error);
    console.error('MongoDB URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
    process.exit(1);
  });

export default app;
