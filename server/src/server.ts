import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';

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

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Serve static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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

// Database connection
console.log('Attempting to connect to MongoDB...');
mongoose.connect(process.env.MONGODB_URI || '')
  .then(() => {
    console.log('Connected to MongoDB Atlas');
    console.log(`Starting server on port ${PORT}...`);
    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT}`);
    });
  })
  .catch((error) => {
    console.error('Database connection error:', error);
    console.error('MongoDB URI:', process.env.MONGODB_URI ? 'Set' : 'Not set');
    process.exit(1);
  });

export default app;
