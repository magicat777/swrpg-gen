import { Router } from 'express';
import { query, param } from 'express-validator';
import timelineController from '../controllers/timelineController';
import { validate } from '../middlewares/validationMiddleware';
import { optionalAuthenticateJWT } from '../middlewares/authMiddleware';

const router = Router();

// Apply optional authentication to all timeline routes
router.use(optionalAuthenticateJWT);

/**
 * @swagger
 * /api/timeline/events:
 *   get:
 *     summary: Get timeline events
 *     description: Retrieves Star Wars timeline events with optional filtering
 *     parameters:
 *       - in: query
 *         name: era
 *         schema:
 *           type: string
 *         description: Filter by era (e.g., "Imperial Era", "Old Republic")
 *       - in: query
 *         name: category
 *         schema:
 *           type: string
 *           enum: [political, military, jedi, sith, technology, cultural, other]
 *         description: Filter by event category
 *       - in: query
 *         name: significance
 *         schema:
 *           type: string
 *           enum: [low, medium, high, critical]
 *         description: Filter by event significance
 *       - in: query
 *         name: startDate
 *         schema:
 *           type: integer
 *         description: Start date filter (BBY/ABY numeric value)
 *       - in: query
 *         name: endDate
 *         schema:
 *           type: integer
 *         description: End date filter (BBY/ABY numeric value)
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for title, description, participants, or location
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 1000
 *         description: Maximum number of events to return (default 100)
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Number of events to skip (default 0)
 *       - in: query
 *         name: sortBy
 *         schema:
 *           type: string
 *           enum: [dateNumeric, title, significance, createdAt]
 *         description: Sort field (default dateNumeric)
 *       - in: query
 *         name: sortOrder
 *         schema:
 *           type: string
 *           enum: [asc, desc]
 *         description: Sort order (default asc)
 *     responses:
 *       200:
 *         description: Timeline events retrieved successfully
 *       400:
 *         description: Invalid query parameters
 *       500:
 *         description: Server error
 */
router.get(
  '/events',
  validate([
    query('era').optional().isString().withMessage('Era must be a string'),
    query('category').optional().isIn(['political', 'military', 'jedi', 'sith', 'technology', 'cultural', 'other']).withMessage('Invalid category'),
    query('significance').optional().isIn(['low', 'medium', 'high', 'critical']).withMessage('Invalid significance'),
    query('startDate').optional().isInt().withMessage('Start date must be an integer'),
    query('endDate').optional().isInt().withMessage('End date must be an integer'),
    query('search').optional().isString().withMessage('Search must be a string'),
    query('limit').optional().isInt({ min: 1, max: 1000 }).withMessage('Limit must be between 1 and 1000'),
    query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be >= 0'),
    query('sortBy').optional().isIn(['dateNumeric', 'title', 'significance', 'createdAt']).withMessage('Invalid sort field'),
    query('sortOrder').optional().isIn(['asc', 'desc']).withMessage('Invalid sort order')
  ]),
  timelineController.getTimelineEvents.bind(timelineController)
);

/**
 * @swagger
 * /api/timeline/eras:
 *   get:
 *     summary: Get timeline eras
 *     description: Retrieves all Star Wars timeline eras
 *     responses:
 *       200:
 *         description: Timeline eras retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/eras', timelineController.getTimelineEras.bind(timelineController));

/**
 * @swagger
 * /api/timeline/events/{eventId}:
 *   get:
 *     summary: Get a specific timeline event
 *     description: Retrieves detailed information about a specific timeline event
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: Timeline event ID
 *     responses:
 *       200:
 *         description: Timeline event retrieved successfully
 *       404:
 *         description: Timeline event not found
 *       400:
 *         description: Invalid event ID format
 *       500:
 *         description: Server error
 */
router.get(
  '/events/:eventId',
  validate([
    param('eventId').notEmpty().withMessage('Event ID is required')
  ]),
  timelineController.getTimelineEvent.bind(timelineController)
);

/**
 * @swagger
 * /api/timeline/stats:
 *   get:
 *     summary: Get timeline statistics
 *     description: Retrieves statistics about timeline events and eras
 *     responses:
 *       200:
 *         description: Timeline statistics retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/stats', timelineController.getTimelineStats.bind(timelineController));

/**
 * @swagger
 * /api/timeline/search:
 *   get:
 *     summary: Search timeline events
 *     description: Search for timeline events by text query
 *     parameters:
 *       - in: query
 *         name: q
 *         required: true
 *         schema:
 *           type: string
 *         description: Search query
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Maximum number of results (default 50)
 *     responses:
 *       200:
 *         description: Search results retrieved successfully
 *       400:
 *         description: Invalid search query
 *       500:
 *         description: Server error
 */
router.get(
  '/search',
  validate([
    query('q').notEmpty().withMessage('Search query is required'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100')
  ]),
  timelineController.searchTimelineEvents.bind(timelineController)
);

export default router;