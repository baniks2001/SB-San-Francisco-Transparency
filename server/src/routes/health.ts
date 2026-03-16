import express from 'express';
import { Request, Response } from 'express';

const router = express.Router();

// Health check endpoint for load balancer
router.get('/health', (req: Request, res: Response) => {
  const health = {
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    instance: process.env.INSTANCE_ID || 'unknown',
    version: process.env.npm_package_version || '1.0.0',
    memory: {
      used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024 * 100) / 100,
      total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024 * 100) / 100
    },
    database: 'connected', // This should be checked dynamically
    services: {
      redis: 'connected', // This should be checked dynamically
      mongodb: 'connected' // This should be checked dynamically
    }
  };

  // Check if the application is under heavy load
  const memoryUsage = process.memoryUsage().heapUsed / process.memoryUsage().heapTotal;
  if (memoryUsage > 0.9) {
    health.status = 'degraded';
    return res.status(503).json(health);
  }

  res.status(200).json(health);
});

// Readiness check endpoint
router.get('/ready', (req: Request, res: Response) => {
  // Check if all critical services are ready
  const checks = {
    database: true, // Implement actual database check
    redis: true,    // Implement actual Redis check
    fileSystem: true // Check if uploads directory is accessible
  };

  const allReady = Object.values(checks).every(check => check === true);

  if (allReady) {
    res.status(200).json({
      status: 'ready',
      checks,
      timestamp: new Date().toISOString()
    });
  } else {
    res.status(503).json({
      status: 'not ready',
      checks,
      timestamp: new Date().toISOString()
    });
  }
});

// Liveness check endpoint
router.get('/live', (req: Request, res: Response) => {
  // Simple liveness check - if the server is responding, it's alive
  res.status(200).json({
    status: 'alive',
    timestamp: new Date().toISOString(),
    pid: process.pid
  });
});

// Metrics endpoint for monitoring
router.get('/metrics', (req: Request, res: Response) => {
  const metrics = {
    timestamp: new Date().toISOString(),
    instance: process.env.INSTANCE_ID || 'unknown',
    uptime: process.uptime(),
    memory: process.memoryUsage(),
    cpu: process.cpuUsage(),
    connections: {
      active: 0, // Would need to implement connection tracking
      total: 0  // Would need to implement connection tracking
    },
    requests: {
      total: 0, // Would need to implement request tracking
      active: 0  // Would need to implement request tracking
    }
  };

  res.status(200).json(metrics);
});

export default router;
