import express from 'express';
import metricsService from '../services/metricsService';
import { logger } from '../utils/logger';

const router = express.Router();

/**
 * @swagger
 * /api/metrics:
 *   get:
 *     summary: Get Prometheus metrics
 *     description: Returns metrics in Prometheus format for scraping
 *     tags: [Monitoring]
 *     responses:
 *       200:
 *         description: Metrics in Prometheus format
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *               example: |
 *                 # HELP swrpg_http_requests_total Total number of HTTP requests
 *                 # TYPE swrpg_http_requests_total counter
 *                 swrpg_http_requests_total{method="GET",route="/api/health",status_code="200"} 42
 */
router.get('/', async (req, res) => {
  try {
    const metrics = await metricsService.getMetrics();
    
    res.set('Content-Type', 'text/plain; version=0.0.4; charset=utf-8');
    res.send(metrics);
    
    logger.debug('📊 Metrics scraped successfully');
  } catch (error) {
    logger.error('Failed to generate metrics:', error);
    res.status(500).send('Failed to generate metrics');
  }
});

/**
 * @swagger
 * /api/metrics/summary:
 *   get:
 *     summary: Get metrics summary
 *     description: Returns a human-readable summary of current metrics
 *     tags: [Monitoring]
 *     responses:
 *       200:
 *         description: Metrics summary
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 timestamp:
 *                   type: string
 *                   format: date-time
 *                 summary:
 *                   type: object
 */
router.get('/summary', async (req, res) => {
  try {
    const registry = metricsService.getRegistry();
    const metrics = await registry.getMetricsAsJSON();
    
    // Parse metrics to create summary
    const summary = {
      timestamp: new Date().toISOString(),
      summary: {
        requests: {
          total: getMetricValue(metrics, 'swrpg_http_requests_total'),
          errors: getMetricValue(metrics, 'swrpg_errors_total'),
          averageResponseTime: getMetricAverage(metrics, 'swrpg_http_request_duration_seconds')
        },
        users: {
          active: getMetricValue(metrics, 'swrpg_active_users'),
          authAttempts: getMetricValue(metrics, 'swrpg_auth_attempts_total')
        },
        business: {
          storyGenerations: getMetricValue(metrics, 'swrpg_story_generations_total'),
          characterCreations: getMetricValue(metrics, 'swrpg_character_creations_total'),
          factionSelections: getMetricValue(metrics, 'swrpg_faction_selections_total'),
          pageViews: getMetricValue(metrics, 'swrpg_page_views_total')
        },
        database: {
          operations: getMetricValue(metrics, 'swrpg_db_operations_total'),
          averageQueryTime: getMetricAverage(metrics, 'swrpg_db_query_duration_seconds')
        },
        system: {
          memoryUsage: getMetricValue(metrics, 'swrpg_memory_usage_bytes'),
          cpuUsage: getMetricValue(metrics, 'swrpg_cpu_usage_percent')
        }
      }
    };
    
    res.json(summary);
    
    logger.debug('📊 Metrics summary generated successfully');
  } catch (error) {
    logger.error('Failed to generate metrics summary:', error);
    res.status(500).json({ error: 'Failed to generate metrics summary' });
  }
});

/**
 * Helper function to get metric value from registry
 */
function getMetricValue(metrics: any[], metricName: string): number {
  const metric = metrics.find(m => m.name === metricName);
  if (!metric) return 0;
  
  if (metric.type === 'counter') {
    return metric.values.reduce((sum: number, v: any) => sum + (v.value || 0), 0);
  } else if (metric.type === 'gauge') {
    return metric.values.reduce((sum: number, v: any) => sum + (v.value || 0), 0);
  }
  
  return 0;
}

/**
 * Helper function to get average from histogram metric
 */
function getMetricAverage(metrics: any[], metricName: string): number {
  const metric = metrics.find(m => m.name === metricName);
  if (!metric || metric.type !== 'histogram') return 0;
  
  const sumMetric = metrics.find(m => m.name === `${metricName}_sum`);
  const countMetric = metrics.find(m => m.name === `${metricName}_count`);
  
  if (!sumMetric || !countMetric) return 0;
  
  const totalSum = sumMetric.values.reduce((sum: number, v: any) => sum + (v.value || 0), 0);
  const totalCount = countMetric.values.reduce((sum: number, v: any) => sum + (v.value || 0), 0);
  
  return totalCount > 0 ? totalSum / totalCount : 0;
}

export default router;