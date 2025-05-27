import { Request, Response, NextFunction } from 'express';
import metricsService from '../services/metricsService';
import { logger } from '../utils/logger';

/**
 * Middleware to collect HTTP request metrics
 */
export const metricsMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  const startTime = Date.now();
  const startHrTime = process.hrtime.bigint();

  // Get request size
  const requestSize = parseInt(req.get('content-length') || '0', 10);

  // Override res.end to capture response metrics
  const originalEnd = res.end;
  let responseSize = 0;

  res.end = function(chunk?: any, encoding?: any, cb?: any): any {
    // Calculate response size
    if (chunk) {
      if (typeof chunk === 'string') {
        responseSize = Buffer.byteLength(chunk, encoding);
      } else if (Buffer.isBuffer(chunk)) {
        responseSize = chunk.length;
      }
    }

    // Calculate duration
    const endHrTime = process.hrtime.bigint();
    const duration = Number(endHrTime - startHrTime) / 1e9; // Convert to seconds

    // Get route pattern (removing query params and IDs)
    const route = getRoutePattern(req.route?.path || req.path);
    const userAgent = req.get('user-agent');

    // Record metrics
    try {
      metricsService.recordHttpRequest(
        req.method,
        route,
        res.statusCode,
        duration,
        requestSize,
        responseSize,
        userAgent
      );

      // Record page view for frontend routes
      if (req.method === 'GET' && isPageRequest(route)) {
        const userType = req.user ? 'authenticated' : 'anonymous';
        const referrer = req.get('referer');
        metricsService.recordPageView(route, userType, referrer);
      }

      // Record errors
      if (res.statusCode >= 400) {
        const severity = getSeverityFromStatusCode(res.statusCode);
        metricsService.recordError('http_error', route, severity);
      }

    } catch (error) {
      logger.error('Failed to record metrics:', error);
    }

    // Call original end method
    return originalEnd.call(this, chunk, encoding, cb);
  };

  next();
};

/**
 * Get normalized route pattern for metrics
 */
function getRoutePattern(path: string): string {
  if (!path) return '/unknown';

  // Remove query parameters
  const cleanPath = path.split('?')[0];

  // Normalize common patterns
  return cleanPath
    // Replace IDs with placeholder
    .replace(/\/[0-9a-fA-F]{24}/g, '/:id') // MongoDB ObjectIDs
    .replace(/\/\d+/g, '/:id') // Numeric IDs
    .replace(/\/[0-9a-fA-F-]{36}/g, '/:uuid') // UUIDs
    // Normalize API versioning
    .replace(/\/v\d+/g, '/v:version')
    // Remove trailing slash
    .replace(/\/$/, '') || '/';
}

/**
 * Check if this is a page request (not API or static assets)
 */
function isPageRequest(route: string): boolean {
  // Skip API endpoints
  if (route.startsWith('/api/')) return false;
  
  // Skip static assets
  if (route.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) return false;
  
  // Skip metrics endpoint
  if (route === '/metrics') return false;
  
  return true;
}

/**
 * Get error severity from HTTP status code
 */
function getSeverityFromStatusCode(statusCode: number): 'low' | 'medium' | 'high' | 'critical' {
  if (statusCode >= 500) return 'critical';
  if (statusCode >= 400 && statusCode < 500) return 'medium';
  if (statusCode >= 300 && statusCode < 400) return 'low';
  return 'low';
}

/**
 * Middleware specifically for authentication metrics
 */
export const authMetricsMiddleware = (req: Request, res: Response, next: NextFunction): void => {
  // Override res.json to capture auth results
  const originalJson = res.json;
  
  res.json = function(obj: any) {
    try {
      const route = req.route?.path || req.path;
      const userAgent = req.get('user-agent');
      
      if (route.includes('/login') || route.includes('/register')) {
        const type = route.includes('/login') ? 'login' : 'register';
        const status = res.statusCode === 200 || res.statusCode === 201 ? 'success' : 'failure';
        
        metricsService.recordAuthAttempt(type as 'login' | 'register', status, userAgent);
      }
    } catch (error) {
      logger.error('Failed to record auth metrics:', error);
    }
    
    return originalJson.call(this, obj);
  };
  
  next();
};

/**
 * Middleware to track database operation metrics
 */
export const dbMetricsWrapper = <T>(
  database: 'mongodb' | 'neo4j' | 'weaviate',
  operation: string,
  collection?: string
) => {
  return async (fn: () => Promise<T>): Promise<T> => {
    const startTime = process.hrtime.bigint();
    
    try {
      const result = await fn();
      
      const endTime = process.hrtime.bigint();
      const duration = Number(endTime - startTime) / 1e9;
      
      metricsService.recordDbOperation(database, operation, duration, 'success', collection);
      
      return result;
    } catch (error) {
      const endTime = process.hrtime.bigint();
      const duration = Number(endTime - startTime) / 1e9;
      
      metricsService.recordDbOperation(database, operation, duration, 'error', collection);
      
      throw error;
    }
  };
};

export default metricsService;