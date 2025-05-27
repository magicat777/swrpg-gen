import express, { Request, Response } from 'express';
import { logger } from '../utils/logger';

const router = express.Router();

/**
 * @swagger
 * /api/health:
 *   get:
 *     summary: Basic health check
 *     description: Returns a simple status to verify API availability
 *     responses:
 *       200:
 *         description: API is operational
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: string
 *                   example: 2023-05-21T12:34:56.789Z
 */
router.get('/', (req: Request, res: Response) => {
  logger.debug('Health check called');
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    version: '1.0.1-cache-test',
  });
});

/**
 * @swagger
 * /api/health/detailed:
 *   get:
 *     summary: Detailed health check
 *     description: Returns detailed health status of various system components
 *     responses:
 *       200:
 *         description: Detailed health information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: ok
 *                 timestamp:
 *                   type: string
 *                   example: 2023-05-21T12:34:56.789Z
 *                 components:
 *                   type: object
 *                   properties:
 *                     api:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           example: ok
 *                     databases:
 *                       type: object
 *                       properties:
 *                         neo4j:
 *                           type: object
 *                           properties:
 *                             status:
 *                               type: string
 *                               example: ok
 *                             latency:
 *                               type: number
 *                               example: 5
 *                         mongodb:
 *                           type: object
 *                           properties:
 *                             status:
 *                               type: string
 *                               example: ok
 *                             latency:
 *                               type: number
 *                               example: 3
 *                         weaviate:
 *                           type: object
 *                           properties:
 *                             status:
 *                               type: string
 *                               example: ok
 *                             latency:
 *                               type: number
 *                               example: 8
 *                     localai:
 *                       type: object
 *                       properties:
 *                         status:
 *                           type: string
 *                           example: ok
 *                         model:
 *                           type: string
 *                           example: swrpg-mistral7b
 *                         latency:
 *                           type: number
 *                           example: 15
 */
router.get('/detailed', async (req: Request, res: Response) => {
  logger.debug('Detailed health check called');
  
  try {
    // Import database service for health checks
    const databaseService = (await import('../services/databaseService')).default;
    
    // Perform database health checks
    const dbHealth = await databaseService.checkHealth();
    
    // Combine with API health information
    const health = {
      status: dbHealth.status,
      timestamp: new Date().toISOString(),
      components: {
        api: {
          status: 'ok',
          uptime: process.uptime(),
          environment: process.env.NODE_ENV || 'development',
        },
        ...dbHealth.components
      }
    };
    
    // Return the full health status
    const statusCode = health.status === 'ok' ? 200 : health.status === 'degraded' ? 200 : 500;
    res.status(statusCode).json(health);
  } catch (error) {
    logger.error('Error in detailed health check', { error });
    res.status(500).json({
      status: 'error',
      message: 'Error checking system health',
      timestamp: new Date().toISOString(),
      error: (error as Error).message
    });
  }
});

// Metrics endpoint for Prometheus
router.get('/metrics', async (req: Request, res: Response) => {
  try {
    const metrics = `# HELP swrpg_http_requests_total Total number of HTTP requests
# TYPE swrpg_http_requests_total counter
swrpg_http_requests_total{method="GET",route="/api/health"} 1

# HELP swrpg_service_up Service availability status
# TYPE swrpg_service_up gauge
swrpg_service_up{service="backend"} 1

# HELP swrpg_uptime_seconds Service uptime in seconds
# TYPE swrpg_uptime_seconds gauge
swrpg_uptime_seconds ${process.uptime()}

# HELP nodejs_version_info Node.js version information
# TYPE nodejs_version_info gauge
nodejs_version_info{version="${process.version}"} 1
`;

    res.set('Content-Type', 'text/plain');
    res.end(metrics);
  } catch (error) {
    res.status(500).json({ error: 'Failed to generate metrics' });
  }
});

export default router;