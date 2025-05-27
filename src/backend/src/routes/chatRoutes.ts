import { Router } from 'express';
import { body, param, query } from 'express-validator';
import chatController from '../controllers/chatController';
import { validate } from '../middlewares/validationMiddleware';
import { authenticateJWT, optionalAuthenticateJWT } from '../middlewares/authMiddleware';

const router = Router();

/**
 * @route POST /api/chat/message
 * @desc Send a chat message (handles both lore queries and regular narrative)
 * @access Private
 */
router.post(
  '/message',
  optionalAuthenticateJWT,
  validate([
    body('message')
      .notEmpty()
      .withMessage('Message is required')
      .isLength({ min: 1, max: 2000 })
      .withMessage('Message must be between 1 and 2000 characters'),
    body('sessionId')
      .optional()
      .isMongoId()
      .withMessage('Invalid session ID format'),
    body('context')
      .optional()
      .isObject()
      .withMessage('Context must be an object'),
    body('messageType')
      .optional()
      .isIn(['user', 'lore_query', 'narrative'])
      .withMessage('Invalid message type')
  ]),
  chatController.sendMessage
);

/**
 * @route GET /api/chat/history/:sessionId
 * @desc Get chat history for a session
 * @access Private
 */
router.get(
  '/history/:sessionId',
  optionalAuthenticateJWT,
  validate([
    param('sessionId')
      .isMongoId()
      .withMessage('Invalid session ID format'),
    query('limit')
      .optional()
      .isInt({ min: 1, max: 100 })
      .withMessage('Limit must be between 1 and 100'),
    query('offset')
      .optional()
      .isInt({ min: 0 })
      .withMessage('Offset must be non-negative')
  ]),
  chatController.getChatHistory
);

/**
 * @route POST /api/chat/stream
 * @desc Stream chat response for real-time interaction
 * @access Private
 */
router.post(
  '/stream',
  optionalAuthenticateJWT,
  validate([
    body('message')
      .notEmpty()
      .withMessage('Message is required')
      .isLength({ min: 1, max: 2000 })
      .withMessage('Message must be between 1 and 2000 characters'),
    body('sessionId')
      .optional()
      .isMongoId()
      .withMessage('Invalid session ID format'),
    body('context')
      .optional()
      .isObject()
      .withMessage('Context must be an object')
  ]),
  chatController.streamChatResponse
);

export default router;