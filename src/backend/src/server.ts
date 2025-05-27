import express, { Express } from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import rateLimit from 'express-rate-limit';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import { logger } from './utils/logger';
import { errorHandler, notFoundHandler } from './middlewares/errorHandler';
import { metricsMiddleware, authMetricsMiddleware } from './middlewares/metricsMiddleware';
// import { securityHeaders, limitRequestSize } from './middlewares/enhancedValidationMiddleware';
import databaseService from './services/databaseService';
import healthRoutes from './routes/healthRoutes';
import authRoutes from './routes/authRoutes';
import generationRoutes from './routes/generationRoutes';
import storyGenerationRoutes from './routes/storyGenerationRoutes';
import adminRoutes from './routes/adminRoutes';
import chatRoutes from './routes/chatRoutes';
import settingsRoutes from './routes/settingsRoutes';
import sessionRoutes from './routes/sessionRoutes';
import worldRoutes from './routes/worldRoutes';
import timelineRoutes from './routes/timelineRoutes';
// import validationRoutes from './routes/validationRoutes';
import metricsRoutes from './routes/metricsRoutes';
import analyticsRoutes from './routes/analyticsRoutes';

// Load environment variables
dotenv.config();

// Initialize Express app
const app: Express = express();
const port = process.env.PORT || 3000;

// Enhanced security middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  }
}));
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:3001',
  credentials: true,
  optionsSuccessStatus: 200
}));
// app.use(securityHeaders);
// app.use(limitRequestSize(10 * 1024 * 1024)); // 10MB global limit
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(morgan('combined', { stream: { write: message => logger.info(message.trim()) } }));

// Rate limiting - More generous for development
const apiLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes (shorter window)
  max: 500, // Increased limit to 500 requests per window
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again later.',
  // Skip rate limiting for certain endpoints during development
  skip: (req) => {
    // Skip rate limiting for health checks
    return req.path.includes('/health');
  }
});

// More restrictive rate limiting specifically for auth endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 auth attempts per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many authentication attempts, please try again later.',
});

// Metrics middleware (before rate limiting to capture all requests)
app.use(metricsMiddleware);

app.use('/api', apiLimiter);
app.use('/api/auth', authLimiter, authMetricsMiddleware);

// Swagger documentation
const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Star Wars RPG Generator API',
      version: '1.0.0',
      description: 'API for Star Wars RPG Generator',
    },
    servers: [
      {
        url: `http://localhost:${port}`,
        description: 'Development server',
      },
    ],
  },
  apis: ['./src/routes/*.ts'],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// Routes
app.use('/api/health', healthRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/generate', generationRoutes);
app.use('/api/story', storyGenerationRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/settings', settingsRoutes);
app.use('/api/sessions', sessionRoutes);
app.use('/api/world', worldRoutes);
app.use('/api/timeline', timelineRoutes);
// app.use('/api/validation', validationRoutes);
app.use('/api/metrics', metricsRoutes);
app.use('/api/analytics', analyticsRoutes);

// 404 Handler
app.use(notFoundHandler);

// Error handling middleware
app.use(errorHandler);

// Initialize database connections before starting the server
const startServer = async () => {
  try {
    // Initialize database connections
    await databaseService.initialize();
    logger.info('Database connections initialized successfully');

    // Start server
    const server = app.listen(port, () => {
      logger.info(`Server running on port ${port}`);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal: string) => {
      logger.info(`${signal} signal received: closing HTTP server`);
      
      server.close(async () => {
        logger.info('HTTP server closed');
        
        try {
          await databaseService.shutdown();
          logger.info('Database connections closed');
          process.exit(0);
        } catch (error) {
          logger.error('Error during shutdown', { error });
          process.exit(1);
        }
      });
    };

    process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
    process.on('SIGINT', () => gracefulShutdown('SIGINT'));

  } catch (error) {
    logger.error('Failed to start server', { error });
    process.exit(1);
  }
};

// Start the server
startServer();

export default app;