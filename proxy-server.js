const express = require('express');
const http = require('http');
const httpProxy = require('http-proxy');
const path = require('path');
const fs = require('fs');
const cors = require('cors');

const app = express();
const PORT = process.env.PORT || 80;

// Create proxy for backend API
const apiProxy = httpProxy.createProxyServer({
  target: 'http://localhost:5000',
  changeOrigin: true,
  ws: true,
  proxyTimeout: 30000,
  timeout: 30000
});

// Handle proxy errors
apiProxy.on('error', (err, req, res) => {
  console.error('Proxy error:', err);
  if (!res.headersSent) {
    res.status(502).json({ 
      error: 'Backend service unavailable',
      message: 'Please ensure the backend server is running on port 5000'
    });
  }
});

// Middleware
app.use(cors());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
  next();
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    frontend: 'running',
    backend: 'connected'
  });
});

// API routes - proxy to backend
app.use('/api', (req, res) => {
  // Remove /api prefix when forwarding to backend
  req.url = req.url.replace('/api', '');
  apiProxy.web(req, res);
});

// Upload routes - proxy to backend
app.use('/uploads', (req, res) => {
  apiProxy.web(req, res);
});

// Serve static files from build directory
const buildPath = path.join(__dirname, 'build');
app.use(express.static(buildPath, {
  maxAge: '1y',
  etag: true,
  lastModified: true
}));

// Handle React Router - serve index.html for all non-API routes
app.get('*', (req, res) => {
  // Don't serve index.html for API or upload routes
  if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) {
    return res.status(404).json({ error: 'Not found' });
  }
  
  const indexPath = path.join(buildPath, 'index.html');
  if (fs.existsSync(indexPath)) {
    res.sendFile(indexPath);
  } else {
    res.status(404).send(`
      <html>
        <head><title>Application Not Found</title></head>
        <body>
          <h1>Application Not Found</h1>
          <p>Please build the frontend application first:</p>
          <pre>npm run build</pre>
        </body>
      </html>
    `);
  }
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Create HTTP server
const server = http.createServer(app);

// Handle server errors
server.on('error', (err) => {
  if (err.code === 'EADDRINUSE') {
    console.error(`❌ Port ${PORT} is already in use.`);
    console.error('Please stop the service using port 80 or choose a different port.');
    console.error('You can use: PORT=8080 node proxy-server.js');
  } else if (err.code === 'EACCES') {
    console.error(`❌ Permission denied for port ${PORT}.`);
    console.error('Please run as administrator or use a port above 1024:');
    console.error('You can use: PORT=8080 node proxy-server.js');
  } else {
    console.error('❌ Server error:', err);
  }
  process.exit(1);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down gracefully');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

// Start server
server.listen(PORT, () => {
  console.log('🚀 Sangguniang Bayan Portal Proxy Server');
  console.log('==========================================');
  console.log(`📡 Server running on port: ${PORT}`);
  console.log(`🌐 Local access: http://localhost${PORT !== 80 ? ':' + PORT : ''}`);
  console.log(`🌐 Network access: http://your-local-ip${PORT !== 80 ? ':' + PORT : ''}`);
  console.log('');
  console.log('📋 Services:');
  console.log('   ✅ Frontend: React application');
  console.log('   ✅ Backend API: /api/* → http://localhost:5000');
  console.log('   ✅ File uploads: /uploads/* → http://localhost:5000');
  console.log('   ✅ Health check: /health');
  console.log('');
  console.log('🔧 Online Access Setup:');
  console.log('   1. Forward port 80 on your router to this computer');
  console.log('   2. Access from anywhere: http://your-public-ip');
  console.log('   3. For HTTPS, consider using Cloudflare or SSL certificate');
  console.log('');
  console.log('⚠️  Make sure backend server is running on port 5000');
  console.log('   cd server && npm run dev');
  console.log('');
  console.log('🛑 To stop: Press Ctrl+C');
});

// Export for testing
module.exports = app;
