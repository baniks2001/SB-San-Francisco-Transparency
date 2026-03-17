import { Request, Response, NextFunction } from 'express';

// Simple in-memory cache for frequently accessed data
const cache = new Map<string, { data: any; timestamp: number; ttl: number }>();

// Cache middleware
export const cacheMiddleware = (ttl: number = 300000) => { // 5 minutes default TTL
  return (req: Request, res: Response, next: NextFunction) => {
    const key = `${req.method}:${req.originalUrl}`;
    const cached = cache.get(key);
    
    if (cached && Date.now() - cached.timestamp < cached.ttl) {
      console.log(`📋 Cache hit for ${key}`);
      return res.json(cached.data);
    }
    
    // Override res.json to cache the response
    const originalJson = res.json;
    res.json = function(data: any) {
      cache.set(key, { data, timestamp: Date.now(), ttl });
      console.log(`📝 Cached response for ${key}`);
      return originalJson.call(this, data);
    };
    
    next();
  };
};

// Clear cache utility
export const clearCache = (pattern?: string) => {
  if (pattern) {
    for (const key of cache.keys()) {
      if (key.includes(pattern)) {
        cache.delete(key);
        console.log(`🗑️ Cleared cache for ${key}`);
      }
    }
  } else {
    cache.clear();
    console.log('🗑️ Cleared all cache');
  }
};

// Cache cleanup interval (every 10 minutes)
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > value.ttl) {
      cache.delete(key);
    }
  }
}, 600000);
