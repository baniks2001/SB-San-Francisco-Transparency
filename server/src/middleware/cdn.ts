import express from 'express';
import path from 'path';

const router = express.Router();

// CDN Configuration - DISABLED (localhost only)
const CDN_CONFIG = {
  // CDN disabled - only localhost access
  enabled: false,
  baseUrl: '',
  fallbackUrl: '',
  
  // Cache control settings
  cacheControl: {
    // Static assets (images, fonts, etc.) - 1 year
    static: 'public, max-age=31536000, immutable',
    
    // HTML files - 1 hour with revalidation
    html: 'public, max-age=3600, must-revalidate',
    
    // API responses - 5 minutes
    api: 'public, max-age=300, must-revalidate',
    
    // Uploaded documents - 1 day
    documents: 'public, max-age=86400, must-revalidate'
  },
  
  // Compression settings
  compression: {
    enabled: true,
    threshold: 1024, // Only compress files larger than 1KB
    level: 6 // Compression level (1-9)
  }
};

// Middleware to set CDN headers
const setCdnHeaders = (req: express.Request, res: express.Response, next: express.NextFunction) => {
  const url = req.url;
  const ext = path.extname(url);
  
  // Determine cache control based on file type
  if (['.jpg', '.jpeg', '.png', '.gif', '.svg', '.webp', '.ico', '.woff', '.woff2', '.ttf', '.eot'].includes(ext)) {
    res.set('Cache-Control', CDN_CONFIG.cacheControl.static);
  } else if (ext === '.html') {
    res.set('Cache-Control', CDN_CONFIG.cacheControl.html);
  } else if (['.pdf', '.doc', '.docx', '.xls', '.xlsx'].includes(ext)) {
    res.set('Cache-Control', CDN_CONFIG.cacheControl.documents);
  }
  
  // Set CORS headers for CDN
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
  
  // Set security headers
  res.set('X-Content-Type-Options', 'nosniff');
  res.set('X-Frame-Options', 'DENY');
  res.set('X-XSS-Protection', '1; mode=block');
  
  next();
};

// Static file serving with CDN support
router.use('/static', setCdnHeaders, express.static(
  path.join(process.cwd(), 'public'), 
  {
    maxAge: '1y',
    etag: true,
    lastModified: true,
    setHeaders: (res, path) => {
      if (CDN_CONFIG.enabled && CDN_CONFIG.baseUrl) {
        // Replace local URLs with CDN URLs in response headers
        res.setHeader('X-CDN-URL', CDN_CONFIG.baseUrl);
      }
    }
  }
));

// Uploaded files with CDN support
router.use('/uploads', setCdnHeaders, express.static(
  path.join(process.cwd(), 'uploads'),
  {
    maxAge: '1d',
    etag: true,
    lastModified: true
  }
));

// CDN health check endpoint
router.get('/cdn/health', (req, res) => {
  res.json({
    status: 'ok',
    cdn: {
      enabled: CDN_CONFIG.enabled,
      baseUrl: CDN_CONFIG.baseUrl,
      timestamp: new Date().toISOString()
    }
  });
});

// CDN cache invalidation endpoint (for admin use)
router.post('/cdn/invalidate', (req, res) => {
  // This would integrate with your CDN provider's API
  // For Cloudflare, you'd use their API to purge cache
  res.json({
    message: 'Cache invalidation requested',
    timestamp: new Date().toISOString()
  });
});

export default router;
