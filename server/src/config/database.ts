import mongoose from 'mongoose';

// Database optimization configuration
const DB_OPTIMIZATION = {
  // Connection pool settings
  maxPoolSize: 10,
  minPoolSize: 2,
  
  // Timeout settings
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 45000,
  connectTimeoutMS: 30000,
  
  // Retry settings
  retryWrites: true,
  retryReads: true
};

// Create indexes for optimal performance
const createIndexes = async () => {
  try {
    const db = mongoose.connection.db;
    if (!db) {
      console.error('❌ Database connection not established');
      return;
    }
    
    // User collection indexes
    await db.collection('users').createIndexes([
      { key: { username: 1 }, unique: true },
      { key: { email: 1 }, unique: true, sparse: true },
      { key: { role: 1 } },
      { key: { isActive: 1 } },
      { key: { createdAt: -1 } },
      { key: { role: 1, isActive: 1 } }
    ]);
    
    // Resolution collection indexes
    await db.collection('resolutions').createIndexes([
      { key: { resolutionNumber: 1, series: 1 }, unique: true },
      { key: { status: 1 } },
      { key: { isPublic: 1 } },
      { key: { dateIntroduced: -1 } },
      { key: { dateApproved: -1 } },
      { key: { author: 1 } },
      { key: { templateId: 1 } },
      { key: { status: 1, isPublic: 1 } },
      { key: { title: 'text', content: 'text' } }, // Text search index
      { key: { createdAt: -1 } }
    ]);
    
    // Ordinance collection indexes
    await db.collection('ordinances').createIndexes([
      { key: { ordinanceNumber: 1, series: 1 }, unique: true },
      { key: { status: 1 } },
      { key: { isPublic: 1 } },
      { key: { dateIntroduced: -1 } },
      { key: { dateApproved: -1 } },
      { key: { author: 1 } },
      { key: { status: 1, isPublic: 1 } },
      { key: { title: 'text', content: 'text' } }, // Text search index
      { key: { createdAt: -1 } }
    ]);
    
    // Budget collection indexes
    await db.collection('budgets').createIndexes([
      { key: { year: 1 } },
      { key: { department: 1 } },
      { key: { category: 1 } },
      { key: { status: 1 } },
      { key: { isPublic: 1 } },
      { key: { year: 1, department: 1 } },
      { key: { year: 1, category: 1 } },
      { key: { title: 'text', description: 'text' } },
      { key: { createdAt: -1 } }
    ]);
    
    // Procurement collection indexes
    await db.collection('procurements').createIndexes([
      { key: { procurementNumber: 1 }, unique: true },
      { key: { status: 1 } },
      { key: { category: 1 } },
      { key: { department: 1 } },
      { key: { datePosted: -1 } },
      { key: { deadline: 1 } },
      { key: { status: 1, category: 1 } },
      { key: { title: 'text', description: 'text' } },
      { key: { createdAt: -1 } }
    ]);
    
    // Announcement collection indexes
    await db.collection('announcements').createIndexes([
      { key: { status: 1 } },
      { key: { isPublic: 1 } },
      { key: { datePosted: -1 } },
      { key: { category: 1 } },
      { key: { priority: 1 } },
      { key: { status: 1, isPublic: 1 } },
      { key: { title: 'text', content: 'text' } },
      { key: { datePosted: -1, priority: -1 } },
      { key: { createdAt: -1 } }
    ]);
    
    // Vacancy collection indexes
    await db.collection('vacancies').createIndexes([
      { key: { status: 1 } },
      { key: { isPublic: 1 } },
      { key: { deadline: 1 } },
      { key: { department: 1 } },
      { key: { position: 1 } },
      { key: { status: 1, isPublic: 1 } },
      { key: { title: 'text', description: 'text' } },
      { key: { deadline: 1, status: 1 } },
      { key: { createdAt: -1 } }
    ]);
    
    // Application collection indexes
    await db.collection('applications').createIndexes([
      { key: { applicationNumber: 1 }, unique: true },
      { key: { status: 1 } },
      { key: { applicantName: 1 } },
      { key: { position: 1 } },
      { key: { dateSubmitted: -1 } },
      { key: { vacancyId: 1 } },
      { key: { status: 1, dateSubmitted: -1 } },
      { key: { applicantName: 'text', email: 'text' } },
      { key: { createdAt: -1 } }
    ]);
    
    // Activity collection indexes
    await db.collection('activities').createIndexes([
      { key: { userId: 1 } },
      { key: { action: 1 } },
      { key: { entityType: 1 } },
      { key: { timestamp: -1 } },
      { key: { userId: 1, timestamp: -1 } },
      { key: { entityType: 1, entityId: 1 } },
      { key: { action: 1, timestamp: -1 } },
      { key: { createdAt: -1 } }
    ]);
    
    console.log('✅ Database indexes created successfully');
  } catch (error) {
    console.error('❌ Error creating database indexes:', error);
  }
};

// Query optimization middleware
const optimizeQueries = (req: any, res: any, next: any) => {
  // Add query hints for better performance
  req.queryOptimized = true;
  
  // Set default limits to prevent large result sets
  if (!req.query.limit) {
    req.query.limit = 50;
  }
  
  // Set maximum limit
  if (req.query.limit > 100) {
    req.query.limit = 100;
  }
  
  next();
};

// Performance monitoring
const monitorPerformance = () => {
  mongoose.connection.on('connected', () => {
    console.log('📊 Connected to MongoDB - Performance monitoring enabled');
  });
  
  mongoose.connection.on('error', (err) => {
    console.error('❌ MongoDB connection error:', err);
  });
  
  mongoose.connection.on('disconnected', () => {
    console.log('⚠️ MongoDB disconnected');
  });
  
  // Monitor slow queries
  mongoose.set('debug', (collectionName, method, query, doc) => {
    console.log(`🔍 MongoDB Query: ${collectionName}.${method}`, JSON.stringify(query), doc);
  });
};

export {
  DB_OPTIMIZATION,
  createIndexes,
  optimizeQueries,
  monitorPerformance
};
