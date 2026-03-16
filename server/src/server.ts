import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
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
import cdnRoutes from './middleware/cdn';
import healthRoutes from './routes/health';

// Load environment variables from parent directory
dotenv.config({ path: '../.env' });

const app = express();
const PORT = process.env.SERVER_PORT || 5000;

// Middleware - Support both localhost and network access
app.use(cors({
  origin: [
    'http://localhost:3000', 
    'http://127.0.0.1:3000',
    'http://10.18.110.103:3000',
    'http://192.168.56.1:3000',
    'http://172.18.80.1:3000'
  ],
  credentials: true
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
