import { register, collectDefaultMetrics, Counter, Histogram, Gauge } from 'prom-client';
import { logger } from '../utils/logger';

/**
 * Comprehensive metrics service for Star Wars RPG Generator
 */
class MetricsService {
  // HTTP Metrics
  public httpRequestTotal: Counter<string>;
  public httpRequestDuration: Histogram<string>;
  public httpRequestSize: Histogram<string>;
  public httpResponseSize: Histogram<string>;

  // Authentication Metrics
  public authAttempts: Counter<string>;
  public activeUsers: Gauge<string>;
  public sessionDuration: Histogram<string>;

  // Database Metrics
  public dbQueryDuration: Histogram<string>;
  public dbConnectionPool: Gauge<string>;
  public dbOperations: Counter<string>;

  // Star Wars RPG Business Metrics
  public storyGenerations: Counter<string>;
  public characterCreations: Counter<string>;
  public factionSelections: Counter<string>;
  public pageViews: Counter<string>;
  public featureUsage: Counter<string>;

  // System Metrics
  public errorRate: Counter<string>;
  public memoryUsage: Gauge<string>;
  public cpuUsage: Gauge<string>;

  constructor() {
    // Enable default system metrics
    collectDefaultMetrics({ register });

    // HTTP Request Metrics
    this.httpRequestTotal = new Counter({
      name: 'swrpg_http_requests_total',
      help: 'Total number of HTTP requests',
      labelNames: ['method', 'route', 'status_code', 'user_agent'],
      registers: [register]
    });

    this.httpRequestDuration = new Histogram({
      name: 'swrpg_http_request_duration_seconds',
      help: 'Duration of HTTP requests in seconds',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5, 10],
      registers: [register]
    });

    this.httpRequestSize = new Histogram({
      name: 'swrpg_http_request_size_bytes',
      help: 'Size of HTTP requests in bytes',
      labelNames: ['method', 'route'],
      buckets: [100, 1000, 10000, 100000, 1000000],
      registers: [register]
    });

    this.httpResponseSize = new Histogram({
      name: 'swrpg_http_response_size_bytes',
      help: 'Size of HTTP responses in bytes',
      labelNames: ['method', 'route', 'status_code'],
      buckets: [100, 1000, 10000, 100000, 1000000],
      registers: [register]
    });

    // Authentication Metrics
    this.authAttempts = new Counter({
      name: 'swrpg_auth_attempts_total',
      help: 'Total authentication attempts',
      labelNames: ['type', 'status', 'user_agent'],
      registers: [register]
    });

    this.activeUsers = new Gauge({
      name: 'swrpg_active_users',
      help: 'Number of currently active users',
      labelNames: ['type'],
      registers: [register]
    });

    this.sessionDuration = new Histogram({
      name: 'swrpg_session_duration_seconds',
      help: 'User session duration in seconds',
      labelNames: ['user_type'],
      buckets: [60, 300, 600, 1800, 3600, 7200, 14400],
      registers: [register]
    });

    // Database Metrics
    this.dbQueryDuration = new Histogram({
      name: 'swrpg_db_query_duration_seconds',
      help: 'Database query duration in seconds',
      labelNames: ['database', 'operation', 'collection'],
      buckets: [0.001, 0.01, 0.1, 0.5, 1, 5, 10],
      registers: [register]
    });

    this.dbConnectionPool = new Gauge({
      name: 'swrpg_db_connections',
      help: 'Number of database connections',
      labelNames: ['database', 'status'],
      registers: [register]
    });

    this.dbOperations = new Counter({
      name: 'swrpg_db_operations_total',
      help: 'Total database operations',
      labelNames: ['database', 'operation', 'status'],
      registers: [register]
    });

    // Star Wars RPG Business Metrics
    this.storyGenerations = new Counter({
      name: 'swrpg_story_generations_total',
      help: 'Total story generations',
      labelNames: ['type', 'era', 'status', 'complexity'],
      registers: [register]
    });

    this.characterCreations = new Counter({
      name: 'swrpg_character_creations_total',
      help: 'Total character creations',
      labelNames: ['faction', 'era', 'status'],
      registers: [register]
    });

    this.factionSelections = new Counter({
      name: 'swrpg_faction_selections_total',
      help: 'Total faction theme selections',
      labelNames: ['faction', 'previous_faction'],
      registers: [register]
    });

    this.pageViews = new Counter({
      name: 'swrpg_page_views_total',
      help: 'Total page views',
      labelNames: ['page', 'user_type', 'referrer'],
      registers: [register]
    });

    this.featureUsage = new Counter({
      name: 'swrpg_feature_usage_total',
      help: 'Total feature usage',
      labelNames: ['feature', 'action', 'success'],
      registers: [register]
    });

    // System Metrics
    this.errorRate = new Counter({
      name: 'swrpg_errors_total',
      help: 'Total application errors',
      labelNames: ['type', 'endpoint', 'severity'],
      registers: [register]
    });

    this.memoryUsage = new Gauge({
      name: 'swrpg_memory_usage_bytes',
      help: 'Memory usage in bytes',
      labelNames: ['type'],
      registers: [register]
    });

    this.cpuUsage = new Gauge({
      name: 'swrpg_cpu_usage_percent',
      help: 'CPU usage percentage',
      registers: [register]
    });

    logger.info('📊 Metrics service initialized with comprehensive Star Wars RPG tracking');
  }

  /**
   * Record HTTP request metrics
   */
  recordHttpRequest(
    method: string,
    route: string,
    statusCode: number,
    duration: number,
    requestSize: number,
    responseSize: number,
    userAgent?: string
  ) {
    const labels = {
      method,
      route,
      status_code: statusCode.toString(),
      user_agent: userAgent || 'unknown'
    };

    this.httpRequestTotal.inc(labels);
    this.httpRequestDuration.observe(
      { method, route, status_code: statusCode.toString() },
      duration
    );
    this.httpRequestSize.observe({ method, route }, requestSize);
    this.httpResponseSize.observe(
      { method, route, status_code: statusCode.toString() },
      responseSize
    );
  }

  /**
   * Record authentication attempt
   */
  recordAuthAttempt(type: 'login' | 'register', status: 'success' | 'failure', userAgent?: string) {
    this.authAttempts.inc({
      type,
      status,
      user_agent: userAgent || 'unknown'
    });
  }

  /**
   * Update active users count
   */
  updateActiveUsers(count: number, type: 'authenticated' | 'anonymous' = 'authenticated') {
    this.activeUsers.set({ type }, count);
  }

  /**
   * Record session duration
   */
  recordSessionDuration(duration: number, userType: 'user' | 'admin' = 'user') {
    this.sessionDuration.observe({ user_type: userType }, duration);
  }

  /**
   * Record database operation
   */
  recordDbOperation(
    database: 'mongodb' | 'neo4j' | 'weaviate',
    operation: string,
    duration: number,
    status: 'success' | 'error',
    collection?: string
  ) {
    this.dbQueryDuration.observe(
      { database, operation, collection: collection || 'unknown' },
      duration
    );
    this.dbOperations.inc({ database, operation, status });
  }

  /**
   * Record story generation
   */
  recordStoryGeneration(
    type: 'character' | 'location' | 'quest' | 'dialogue',
    era: string,
    status: 'success' | 'error',
    complexity: 'simple' | 'moderate' | 'complex'
  ) {
    this.storyGenerations.inc({ type, era, status, complexity });
  }

  /**
   * Record character creation
   */
  recordCharacterCreation(faction: string, era: string, status: 'success' | 'error') {
    this.characterCreations.inc({ faction, era, status });
  }

  /**
   * Record faction selection
   */
  recordFactionSelection(faction: string, previousFaction?: string) {
    this.factionSelections.inc({
      faction,
      previous_faction: previousFaction || 'none'
    });
  }

  /**
   * Record page view
   */
  recordPageView(page: string, userType: 'authenticated' | 'anonymous', referrer?: string) {
    this.pageViews.inc({
      page,
      user_type: userType,
      referrer: referrer || 'direct'
    });
  }

  /**
   * Record feature usage
   */
  recordFeatureUsage(feature: string, action: string, success: boolean) {
    this.featureUsage.inc({
      feature,
      action,
      success: success.toString()
    });
  }

  /**
   * Record error
   */
  recordError(type: string, endpoint: string, severity: 'low' | 'medium' | 'high' | 'critical') {
    this.errorRate.inc({ type, endpoint, severity });
  }

  /**
   * Update system metrics
   */
  updateSystemMetrics() {
    const memUsage = process.memoryUsage();
    this.memoryUsage.set({ type: 'rss' }, memUsage.rss);
    this.memoryUsage.set({ type: 'heap_used' }, memUsage.heapUsed);
    this.memoryUsage.set({ type: 'heap_total' }, memUsage.heapTotal);
    this.memoryUsage.set({ type: 'external' }, memUsage.external);

    // CPU usage would require additional monitoring
    // For now, we'll use a placeholder that could be enhanced
    const cpuUsage = process.cpuUsage();
    this.cpuUsage.set((cpuUsage.user + cpuUsage.system) / 1000000);
  }

  /**
   * Get metrics registry for Prometheus scraping
   */
  getRegistry() {
    return register;
  }

  /**
   * Get metrics in Prometheus format
   */
  async getMetrics(): Promise<string> {
    this.updateSystemMetrics();
    return register.metrics();
  }
}

// Export singleton instance
export default new MetricsService();