import { VercelRequest, VercelResponse } from '@vercel/node';
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import path from 'path';

// Import routes
import authRoutes from '../server/src/routes/auth';
import userRoutes from '../server/src/routes/users';
import resolutionRoutes from '../server/src/routes/resolutions';
import ordinanceRoutes from '../server/src/routes/ordinances';
import procurementRoutes from '../server/src/routes/procurements';
import budgetRoutes from '../server/src/routes/budgets';
import vacancyRoutes from '../server/src/routes/vacancies';
import applicationRoutes from '../server/src/routes/applications';
import announcementRoutes from '../server/src/routes/announcements';
import systemRoutes from '../server/src/routes/system';
import settingsRoutes from '../server/src/routes/settings';
import templateRoutes from '../server/src/routes/templates';

// Create Express app
const app = express();

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

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

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Database connection
let isConnected = false;

const connectDB = async () => {
  if (isConnected) return;
  
  try {
    console.log('Attempting to connect to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI || '', {
      serverSelectionTimeoutMS: 30000,
      socketTimeoutMS: 45000,
      connectTimeoutMS: 30000,
      maxPoolSize: 10,
      minPoolSize: 2,
    });
    isConnected = true;
    console.log('Connected to MongoDB Atlas');
  } catch (error) {
    console.error('Database connection error:', error);
    throw error;
  }
};

// Main handler for Vercel
export default async function handler(req: VercelRequest, res: VercelResponse) {
  // Connect to database if not already connected
  if (!isConnected) {
    try {
      await connectDB();
    } catch (error) {
      return res.status(500).json({ 
        error: 'Database connection failed',
        message: 'Unable to connect to MongoDB'
      });
    }
  }

  // Handle the request with Express app
  return app(req, res);
}
