import { Router } from 'express';
import { body, query, param } from 'express-validator';
import sessionController from '../controllers/sessionController';
import { validate } from '../middlewares/validationMiddleware';
import { optionalAuthenticateJWT } from '../middlewares/authMiddleware';

const router = Router();

// Apply optional authentication to all session routes
router.use(optionalAuthenticateJWT);

/**
 * @swagger
 * /api/sessions:
 *   post:
 *     summary: Create a new session
 *     description: Creates a new RPG session with campaign settings
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - campaignName
 *             properties:
 *               campaignName:
 *                 type: string
 *                 description: Name of the campaign
 *               description:
 *                 type: string
 *                 description: Campaign description
 *               setting:
 *                 type: object
 *                 properties:
 *                   era:
 *                     type: string
 *                     enum: [Original Trilogy, Prequel Era, Sequel Era, Old Republic, New Republic]
 *                   startingLocation:
 *                     type: string
 *               campaignSettings:
 *                 type: object
 *                 properties:
 *                   playerCount:
 *                     type: integer
 *                     minimum: 1
 *                     maximum: 8
 *                   difficulty:
 *                     type: string
 *                     enum: [easy, normal, hard, epic]
 *                   campaignLength:
 *                     type: string
 *                     enum: [short, medium, long, ongoing]
 *               toneStyle:
 *                 type: object
 *                 properties:
 *                   themes:
 *                     type: array
 *                     items:
 *                       type: string
 *               advancedOptions:
 *                 type: object
 *                 properties:
 *                   aiFeatures:
 *                     type: boolean
 *     responses:
 *       201:
 *         description: Session created successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post(
  '/',
  validate([
    body('campaignName').isLength({ min: 1, max: 100 }).withMessage('Campaign name must be 1-100 characters'),
    body('description').optional().isLength({ max: 500 }).withMessage('Description must be max 500 characters'),
    body('setting.era').optional().isIn([
      'Original Trilogy', 'Prequel Era', 'Sequel Era', 'Old Republic', 'New Republic'
    ]).withMessage('Invalid era'),
    body('campaignSettings.playerCount').optional().isInt({ min: 1, max: 8 }).withMessage('Player count must be 1-8'),
    body('campaignSettings.difficulty').optional().isIn(['easy', 'normal', 'hard', 'epic']).withMessage('Invalid difficulty'),
    body('campaignSettings.campaignLength').optional().isIn(['short', 'medium', 'long', 'ongoing']).withMessage('Invalid campaign length'),
    body('toneStyle.themes').optional().isArray().withMessage('Themes must be an array'),
    body('advancedOptions.aiFeatures').optional().isBoolean().withMessage('AI features must be boolean')
  ]),
  sessionController.createSession.bind(sessionController)
);

/**
 * @swagger
 * /api/sessions:
 *   get:
 *     summary: Get all sessions for the current user
 *     description: Retrieves all active sessions for the authenticated user
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Maximum number of sessions to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Number of sessions to skip
 *     responses:
 *       200:
 *         description: Sessions retrieved successfully
 *       500:
 *         description: Server error
 */
router.get('/', sessionController.getSessions.bind(sessionController));

/**
 * @swagger
 * /api/sessions/{sessionId}:
 *   get:
 *     summary: Get a specific session
 *     description: Retrieves a specific session by ID
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Session ID
 *     responses:
 *       200:
 *         description: Session retrieved successfully
 *       404:
 *         description: Session not found
 *       500:
 *         description: Server error
 */
router.get(
  '/:sessionId',
  validate([
    param('sessionId').notEmpty().withMessage('Session ID is required')
  ]),
  sessionController.getSession.bind(sessionController)
);

/**
 * @swagger
 * /api/sessions/{sessionId}:
 *   put:
 *     summary: Update a session
 *     description: Updates an existing session
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Session ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               campaignName:
 *                 type: string
 *               description:
 *                 type: string
 *               setting:
 *                 type: object
 *               campaignSettings:
 *                 type: object
 *               toneStyle:
 *                 type: object
 *               advancedOptions:
 *                 type: object
 *     responses:
 *       200:
 *         description: Session updated successfully
 *       404:
 *         description: Session not found
 *       500:
 *         description: Server error
 */
router.put(
  '/:sessionId',
  validate([
    param('sessionId').notEmpty().withMessage('Session ID is required'),
    body('campaignName').optional().isLength({ min: 1, max: 100 }).withMessage('Campaign name must be 1-100 characters'),
    body('description').optional().isLength({ max: 500 }).withMessage('Description must be max 500 characters')
  ]),
  sessionController.updateSession.bind(sessionController)
);

/**
 * @swagger
 * /api/sessions/{sessionId}:
 *   delete:
 *     summary: Delete a session
 *     description: Soft deletes a session (marks as inactive)
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Session ID
 *     responses:
 *       200:
 *         description: Session deleted successfully
 *       404:
 *         description: Session not found
 *       500:
 *         description: Server error
 */
router.delete(
  '/:sessionId',
  validate([
    param('sessionId').notEmpty().withMessage('Session ID is required')
  ]),
  sessionController.deleteSession.bind(sessionController)
);

/**
 * @swagger
 * /api/sessions/{sessionId}/messages:
 *   get:
 *     summary: Get messages for a session
 *     description: Retrieves all messages for a specific session
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Session ID
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *         description: Maximum number of messages to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *         description: Number of messages to skip
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [user, ai, system]
 *         description: Filter by message type
 *     responses:
 *       200:
 *         description: Messages retrieved successfully
 *       500:
 *         description: Server error
 */
router.get(
  '/:sessionId/messages',
  validate([
    param('sessionId').notEmpty().withMessage('Session ID is required'),
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be 1-100'),
    query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be >= 0'),
    query('type').optional().isIn(['user', 'ai', 'system']).withMessage('Invalid message type')
  ]),
  sessionController.getSessionMessages.bind(sessionController)
);

/**
 * @swagger
 * /api/sessions/{sessionId}/messages:
 *   post:
 *     summary: Add a message to a session
 *     description: Adds a new message to a session
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Session ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - type
 *               - content
 *             properties:
 *               type:
 *                 type: string
 *                 enum: [user, ai, system]
 *               content:
 *                 type: string
 *               sender:
 *                 type: string
 *               metadata:
 *                 type: object
 *     responses:
 *       201:
 *         description: Message added successfully
 *       400:
 *         description: Invalid input
 *       500:
 *         description: Server error
 */
router.post(
  '/:sessionId/messages',
  validate([
    param('sessionId').notEmpty().withMessage('Session ID is required'),
    body('type').isIn(['user', 'ai', 'system']).withMessage('Type must be user, ai, or system'),
    body('content').isLength({ min: 1, max: 10000 }).withMessage('Content must be 1-10000 characters'),
    body('sender').optional().isLength({ max: 100 }).withMessage('Sender must be max 100 characters'),
    body('metadata').optional().isObject().withMessage('Metadata must be an object')
  ]),
  sessionController.addMessage.bind(sessionController)
);

/**
 * @swagger
 * /api/sessions/{sessionId}/messages/search:
 *   get:
 *     summary: Search messages in a session
 *     description: Searches for messages containing specific text
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Session ID
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
 *           maximum: 50
 *         description: Maximum number of results
 *       - in: query
 *         name: type
 *         schema:
 *           type: string
 *           enum: [user, ai, system]
 *         description: Filter by message type
 *     responses:
 *       200:
 *         description: Search results retrieved
 *       400:
 *         description: Invalid search query
 *       500:
 *         description: Server error
 */
router.get(
  '/:sessionId/messages/search',
  validate([
    param('sessionId').notEmpty().withMessage('Session ID is required'),
    query('q').notEmpty().withMessage('Search query is required'),
    query('limit').optional().isInt({ min: 1, max: 50 }).withMessage('Limit must be 1-50'),
    query('type').optional().isIn(['user', 'ai', 'system']).withMessage('Invalid message type')
  ]),
  sessionController.searchMessages.bind(sessionController)
);

/**
 * @swagger
 * /api/sessions/{sessionId}/stats:
 *   get:
 *     summary: Get session statistics
 *     description: Retrieves statistics for a specific session
 *     parameters:
 *       - in: path
 *         name: sessionId
 *         required: true
 *         schema:
 *           type: string
 *         description: Session ID
 *     responses:
 *       200:
 *         description: Statistics retrieved successfully
 *       404:
 *         description: Session not found
 *       500:
 *         description: Server error
 */
router.get(
  '/:sessionId/stats',
  validate([
    param('sessionId').notEmpty().withMessage('Session ID is required')
  ]),
  sessionController.getSessionStats.bind(sessionController)
);

export default router;