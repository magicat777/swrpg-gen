import express from 'express';
import { logger } from '../utils/logger';
import metricsService from '../services/metricsService';

const router = express.Router();

interface AnalyticsEvent {
  category: string;
  action: string;
  label?: string;
  value?: number;
  customDimensions?: Record<string, string | number>;
}

interface UserSession {
  sessionId: string;
  userId?: string;
  startTime: number;
  lastActivity: number;
  pageViews: number;
  events: number;
  userAgent: string;
  referrer?: string;
  faction?: string;
}

interface AnalyticsPayload {
  session: UserSession;
  events: AnalyticsEvent[];
}

/**
 * @swagger
 * /api/analytics/events:
 *   post:
 *     summary: Receive frontend analytics events
 *     description: Endpoint for frontend to send analytics events and session data
 *     tags: [Analytics]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               session:
 *                 type: object
 *                 properties:
 *                   sessionId:
 *                     type: string
 *                   userId:
 *                     type: string
 *                   startTime:
 *                     type: number
 *                   lastActivity:
 *                     type: number
 *                   pageViews:
 *                     type: number
 *                   events:
 *                     type: number
 *                   userAgent:
 *                     type: string
 *                   faction:
 *                     type: string
 *               events:
 *                 type: array
 *                 items:
 *                   type: object
 *                   properties:
 *                     category:
 *                       type: string
 *                     action:
 *                       type: string
 *                     label:
 *                       type: string
 *                     value:
 *                       type: number
 *                     customDimensions:
 *                       type: object
 *     responses:
 *       200:
 *         description: Events processed successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 processed:
 *                   type: number
 *                   example: 5
 *       400:
 *         description: Invalid payload
 */
router.post('/events', async (req, res) => {
  try {
    const payload: AnalyticsPayload = req.body;
    
    if (!payload.session || !Array.isArray(payload.events)) {
      return res.status(400).json({
        status: 'error',
        message: 'Invalid payload: session and events are required'
      });
    }

    const { session, events } = payload;
    
    // Process each event and convert to metrics
    let processedEvents = 0;
    
    for (const event of events) {
      try {
        await processAnalyticsEvent(event, session);
        processedEvents++;
      } catch (error) {
        logger.error('Failed to process analytics event:', error, event);
      }
    }

    // Update session metrics
    updateSessionMetrics(session);
    
    logger.debug(`📊 Processed ${processedEvents}/${events.length} analytics events from session ${session.sessionId}`);
    
    return res.json({
      status: 'success',
      processed: processedEvents
    });
    
  } catch (error) {
    logger.error('Failed to process analytics events:', error);
    return res.status(500).json({
      status: 'error',
      message: 'Failed to process analytics events'
    });
  }
});

/**
 * Process individual analytics event and record appropriate metrics
 */
async function processAnalyticsEvent(event: AnalyticsEvent, session: UserSession): Promise<void> {
  const userType = session.userId ? 'authenticated' : 'anonymous';
  
  switch (event.category) {
    case 'Navigation':
      if (event.action === 'Page View') {
        metricsService.recordPageView(
          event.label || 'unknown',
          userType,
          event.customDimensions?.referrer as string
        );
      }
      break;
      
    case 'Star Wars RPG':
      if (event.action === 'Story Generation') {
        const { type, era, success } = event.customDimensions || {};
        metricsService.recordStoryGeneration(
          type as 'character' | 'location' | 'quest' | 'dialogue',
          era as string,
          success === 'true' ? 'success' : 'error',
          'moderate' // Default complexity, could be enhanced
        );
      } else if (event.action === 'Character Creation') {
        const { faction, era, success } = event.customDimensions || {};
        metricsService.recordCharacterCreation(
          faction as string,
          era as string,
          success === 'true' ? 'success' : 'error'
        );
      } else if (event.action === 'Faction Selection') {
        const { newFaction, previousFaction } = event.customDimensions || {};
        metricsService.recordFactionSelection(
          newFaction as string,
          previousFaction as string
        );
      }
      break;
      
    case 'Feature Usage':
      metricsService.recordFeatureUsage(
        event.action,
        event.label || 'unknown',
        event.value === 1
      );
      break;
      
    case 'Auth':
      if (event.action === 'Login' || event.action === 'Register') {
        const success = event.value === 1;
        metricsService.recordAuthAttempt(
          event.action.toLowerCase() as 'login' | 'register',
          success ? 'success' : 'failure',
          session.userAgent
        );
      }
      break;
      
    case 'Error':
      metricsService.recordError(
        event.action,
        event.customDimensions?.page as string || 'unknown',
        'medium' // Default severity
      );
      break;
      
    case 'Performance':
      // Performance metrics are already captured by browser APIs
      // Could be enhanced to record specific performance metrics
      break;
      
    case 'UI':
    case 'Engagement':
      // These provide valuable user interaction data
      // Could be expanded to specific metrics if needed
      break;
  }
  
  // Record general feature usage for any event
  metricsService.recordFeatureUsage(
    event.category,
    event.action,
    event.value !== 0
  );
}

/**
 * Update session-related metrics
 */
function updateSessionMetrics(session: UserSession): void {
  // Update active users count (this is simplified - in production you'd want a more sophisticated approach)
  const userType = session.userId ? 'authenticated' : 'anonymous';
  metricsService.updateActiveUsers(1, userType);
  
  // Record session duration if session ended
  if (session.lastActivity && session.startTime) {
    const duration = (session.lastActivity - session.startTime) / 1000; // Convert to seconds
    const userRole = session.userId ? 'user' : 'anonymous';
    
    // Only record if session has been active for more than 30 seconds
    if (duration > 30) {
      metricsService.recordSessionDuration(duration, userRole as 'user' | 'admin');
    }
  }
}

/**
 * @swagger
 * /api/analytics/session:
 *   get:
 *     summary: Get current analytics session info
 *     description: Returns information about active analytics sessions
 *     tags: [Analytics]
 *     responses:
 *       200:
 *         description: Session information
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 activeSessions:
 *                   type: number
 *                 totalEvents:
 *                   type: number
 *                 uptime:
 *                   type: number
 */
router.get('/session', async (req, res) => {
  try {
    // This would typically query a session store or database
    // For now, return basic system information
    const uptime = process.uptime();
    
    res.json({
      status: 'success',
      data: {
        uptime: uptime,
        timestamp: new Date().toISOString(),
        version: '1.0.0'
      }
    });
    
  } catch (error) {
    logger.error('Failed to get session info:', error);
    res.status(500).json({
      status: 'error',
      message: 'Failed to get session info'
    });
  }
});

export default router;