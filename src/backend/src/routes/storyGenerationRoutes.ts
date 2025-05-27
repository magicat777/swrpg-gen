import { Router } from 'express';
import { body, query, param } from 'express-validator';
import storyGenerationController from '../controllers/storyGenerationController';
import { validate } from '../middlewares/validationMiddleware';
import { authenticateJWT, optionalAuthenticateJWT } from '../middlewares/authMiddleware';
import { 
  requirePermission, 
  attachUserPermissions, 
  validateTokenLimit,
  Permission 
} from '../middlewares/roleAuthMiddleware';

const router = Router();

// Apply authentication middleware to all story generation routes
router.use(optionalAuthenticateJWT);
router.use(attachUserPermissions);
router.use(validateTokenLimit);

/**
 * POST /api/story/generate/narrative
 * Generate narrative continuation based on user input and context
 */
router.post(
  '/generate/narrative',
  requirePermission(Permission.GENERATE_CONTENT),
  validate([
    body('sessionId').notEmpty().withMessage('Session ID is required'),
    body('userInput').isLength({ min: 1, max: 2000 }).withMessage('User input must be 1-2000 characters'),
    body('options.style').optional().isIn(['action', 'dialogue', 'description', 'introspection']),
    body('options.length').optional().isIn(['short', 'medium', 'long']),
    body('options.tone').optional().isIn(['dramatic', 'lighthearted', 'suspenseful', 'mysterious']),
    body('options.temperature').optional().isFloat({ min: 0, max: 2 }),
    body('options.maxTokens').optional().isInt({ min: 50, max: 2000 })
  ]),
  storyGenerationController.generateNarrative.bind(storyGenerationController)
);

/**
 * POST /api/story/generate/dialogue
 * Generate character dialogue for specific situations
 */
router.post(
  '/generate/dialogue',
  requirePermission(Permission.GENERATE_CONTENT),
  validate([
    body('sessionId').notEmpty().withMessage('Session ID is required'),
    body('characterId').notEmpty().withMessage('Character ID is required'),
    body('situation').isLength({ min: 1, max: 500 }).withMessage('Situation must be 1-500 characters'),
    body('targetAudience').isLength({ min: 1, max: 200 }).withMessage('Target audience must be 1-200 characters'),
    body('previousContext').optional().isLength({ max: 1000 }),
    body('options.emotionalState').optional().isLength({ max: 50 }),
    body('options.temperature').optional().isFloat({ min: 0, max: 2 })
  ]),
  storyGenerationController.generateDialogue.bind(storyGenerationController)
);

/**
 * POST /api/story/generate/scene
 * Generate scene descriptions for locations
 */
router.post(
  '/generate/scene',
  requirePermission(Permission.GENERATE_CONTENT),
  validate([
    body('sessionId').notEmpty().withMessage('Session ID is required'),
    body('locationId').notEmpty().withMessage('Location ID is required'),
    body('atmosphere').optional().isLength({ max: 100 }),
    body('focusElements').optional().isLength({ max: 200 }),
    body('options.temperature').optional().isFloat({ min: 0, max: 2 }),
    body('options.maxTokens').optional().isInt({ min: 50, max: 800 })
  ]),
  storyGenerationController.generateSceneDescription.bind(storyGenerationController)
);

/**
 * POST /api/story/analyze
 * Analyze story content for entities, sentiment, themes, and contradictions
 */
router.post(
  '/analyze',
  requirePermission(Permission.GENERATE_CONTENT),
  validate([
    body('content').isLength({ min: 10, max: 10000 }).withMessage('Content must be 10-10000 characters'),
    body('sessionId').optional().notEmpty(),
    body('options.includeEntities').optional().isBoolean(),
    body('options.includeSentiment').optional().isBoolean(),
    body('options.includeThemes').optional().isBoolean(),
    body('options.includeContradictions').optional().isBoolean()
  ]),
  storyGenerationController.analyzeStory.bind(storyGenerationController)
);

/**
 * POST /api/story/stream/narrative
 * Stream narrative generation using Server-Sent Events
 */
router.post(
  '/stream/narrative',
  requirePermission(Permission.GENERATE_CONTENT),
  validate([
    body('sessionId').notEmpty().withMessage('Session ID is required'),
    body('userInput').isLength({ min: 1, max: 2000 }).withMessage('User input must be 1-2000 characters'),
    body('options.temperature').optional().isFloat({ min: 0, max: 2 }),
    body('options.maxTokens').optional().isInt({ min: 50, max: 2000 })
  ]),
  storyGenerationController.streamNarrative.bind(storyGenerationController)
);

/**
 * GET /api/story/templates
 * Get available story generation templates and their parameters
 */
router.get('/templates', async (req, res) => {
  try {
    const templates = {
      narrative: {
        styles: ['action', 'dialogue', 'description', 'introspection'],
        lengths: ['short', 'medium', 'long'],
        tones: ['dramatic', 'lighthearted', 'suspenseful', 'mysterious']
      },
      dialogue: {
        emotionalStates: [
          'neutral', 'happy', 'sad', 'angry', 'fearful', 'surprised',
          'determined', 'confused', 'suspicious', 'confident', 'desperate'
        ]
      },
      scene: {
        atmospheres: [
          'peaceful', 'tense', 'mysterious', 'chaotic', 'serene',
          'foreboding', 'bustling', 'desolate', 'majestic', 'dangerous'
        ]
      }
    };

    res.json({
      success: true,
      data: templates
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to retrieve templates'
    });
  }
});

/**
 * GET /api/story/session/:sessionId/context
 * Get assembled context for a session
 */
router.get('/session/:sessionId/context', async (req, res) => {
  try {
    const { sessionId } = req.params;
    const { types, maxTokens = 2000, maxItems = 10 } = req.query;

    const contextAssemblyService = require('../services/contextAssemblyService').default;
    const { ContextType } = require('../services/contextAssemblyService');

    // Parse context types from query parameter
    let contextTypes = Object.values(ContextType);
    if (types && typeof types === 'string') {
      const requestedTypes = types.split(',');
      contextTypes = contextTypes.filter(type => requestedTypes.includes(type as string));
    }

    const assembledContext = await contextAssemblyService.assembleContext({
      types: contextTypes,
      sessionId,
      maxTokens: Number(maxTokens),
      maxItems: Number(maxItems)
    });

    res.json({
      success: true,
      data: {
        context: assembledContext,
        metadata: {
          sessionId,
          types: contextTypes,
          maxTokens: Number(maxTokens),
          maxItems: Number(maxItems),
          contextLength: assembledContext.length,
          timestamp: new Date().toISOString()
        }
      }
    });

  } catch (error) {
    res.status(500).json({
      success: false,
      error: 'Failed to assemble context'
    });
  }
});

/**
 * POST /api/story/validate
 * Validate story content for consistency and quality
 */
router.post(
  '/validate',
  requirePermission(Permission.GENERATE_CONTENT),
  validate([
    body('content').isLength({ min: 10, max: 5000 }).withMessage('Content must be 10-5000 characters'),
    body('sessionId').optional().notEmpty(),
    body('validationRules.checkConsistency').optional().isBoolean(),
    body('validationRules.checkLore').optional().isBoolean(),
    body('validationRules.checkCharacterVoice').optional().isBoolean(),
    body('validationRules.checkTimeline').optional().isBoolean()
  ]),
  async (req, res) => {
    try {
      const { content, sessionId, validationRules = {} } = req.body;
      
      const storyAnalysisService = require('../services/storyAnalysisService').default;
      
      // Get comprehensive analysis
      const analysis = await storyAnalysisService.analyzeStory(content, sessionId);
      
      // Build validation response
      const validation = {
        isValid: true,
        score: 85, // Base score
        issues: [] as any[],
        suggestions: [] as string[]
      };

      // Check for contradictions if requested
      if (validationRules.checkConsistency !== false) {
        const highSeverityContradictions = analysis.contradictions.contradictions
          .filter((c: any) => c.severity === 'high');
        
        if (highSeverityContradictions.length > 0) {
          validation.isValid = false;
          validation.score -= highSeverityContradictions.length * 15;
          validation.issues.push(...highSeverityContradictions);
        }
      }

      // Check sentiment extremes
      if (analysis.sentiment.tension > 8) {
        validation.suggestions.push('Consider moderating tension levels for better pacing');
      }

      // Check for new entities
      const newEntities = [
        ...analysis.entities.characters.filter((c: any) => c.isNew),
        ...analysis.entities.locations.filter((l: any) => l.isNew)
      ];

      if (newEntities.length > 3) {
        validation.suggestions.push('Many new entities introduced - consider developing existing ones');
      }

      res.json({
        success: true,
        data: {
          validation,
          analysis: {
            sentiment: analysis.sentiment,
            themes: analysis.themes,
            entities: analysis.entities,
            contradictions: analysis.contradictions
          }
        }
      });

    } catch (error) {
      res.status(500).json({
        success: false,
        error: 'Failed to validate story content'
      });
    }
  }
);

export default router;