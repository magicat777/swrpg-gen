import express from 'express';
import { body } from 'express-validator';
import generationController from '../controllers/generationController';
import { validate } from '../middlewares/validationMiddleware';
import { authenticateJWT, optionalAuthenticateJWT, authenticateApiKey } from '../middlewares/authMiddleware';
import { 
  requirePermission, 
  attachUserPermissions, 
  validateTokenLimit,
  Permission 
} from '../middlewares/roleAuthMiddleware';
// import { 
//   sanitizeInput, 
//   ContentValidation, 
//   securityHeaders, 
//   limitRequestSize 
// } from '../middlewares/enhancedValidationMiddleware';

const router = express.Router();

// Apply security middleware to all generation routes
// router.use(securityHeaders);
// router.use(limitRequestSize(2 * 1024 * 1024)); // 2MB limit for generation requests
// router.use(sanitizeInput);

/**
 * Authentication middleware - either JWT or API key
 */
const auth = [
  (req: express.Request, res: express.Response, next: express.NextFunction) => {
    // Check for API key first
    if (req.headers['x-api-key']) {
      return authenticateApiKey(req, res, next);
    }
    // Otherwise use optional JWT authentication
    return optionalAuthenticateJWT(req, res, next);
  },
  attachUserPermissions,
  validateTokenLimit
];

/**
 * @swagger
 * /api/generate/character:
 *   post:
 *     summary: Generate a character
 *     description: Generate a Star Wars character based on parameters
 *     tags: [Generation]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - era
 *               - species
 *               - affiliation
 *               - characterType
 *             properties:
 *               era:
 *                 type: string
 *                 description: Star Wars era (e.g., "Imperial Era", "High Republic")
 *               species:
 *                 type: string
 *                 description: Character species (e.g., "Human", "Twi'lek")
 *               affiliation:
 *                 type: string
 *                 description: Character's faction or allegiance (e.g., "Rebel Alliance", "Galactic Empire")
 *               characterType:
 *                 type: string
 *                 description: Character archetype (e.g., "Smuggler", "Jedi Knight")
 *               forceSensitive:
 *                 type: boolean
 *                 description: Whether the character is Force-sensitive
 *               sessionId:
 *                 type: string
 *                 description: Optional session ID to associate the generated content with
 *     responses:
 *       200:
 *         description: Character generated successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Generation error
 */
router.post(
  '/character',
  auth,
  requirePermission(Permission.GENERATE_CONTENT),
  validate([
    // ContentValidation.STAR_WARS_ERA.withMessage('Era is required'),
    // ContentValidation.STAR_WARS_SPECIES.withMessage('Species is required'),
    body('affiliation')
      .notEmpty()
      .withMessage('Affiliation is required')
      .isLength({ min: 2, max: 50 })
      .withMessage('Affiliation must be 2-50 characters')
      .matches(/^[a-zA-Z\s\-'&]+$/)
      .withMessage('Affiliation contains invalid characters'),
    body('characterType')
      .notEmpty()
      .withMessage('Character type is required')
      .isIn(['hero', 'villain', 'neutral', 'npc', 'support'])
      .withMessage('Invalid character type'),
    body('forceSensitive')
      .isBoolean()
      .withMessage('Force sensitive must be a boolean'),
    // ContentValidation.GENERATION_TOKENS,
    // ContentValidation.GENERATION_TEMPERATURE,
    body('sessionId').optional().isMongoId().withMessage('Invalid session ID format'),
    body('additionalNotes')
      .optional()
      .isLength({ max: 500 })
      .withMessage('Additional notes must be under 500 characters')
  ]),
  generationController.generateCharacter
);

/**
 * @swagger
 * /api/generate/location:
 *   post:
 *     summary: Generate a location
 *     description: Generate a Star Wars location based on parameters
 *     tags: [Generation]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - planet
 *               - locationType
 *               - era
 *             properties:
 *               planet:
 *                 type: string
 *                 description: Planet name (e.g., "Tatooine", "Coruscant")
 *               region:
 *                 type: string
 *                 description: Region on the planet (e.g., "Mos Eisley", "Senate District")
 *               locationType:
 *                 type: string
 *                 description: Type of location (e.g., "Cantina", "Imperial Facility")
 *               era:
 *                 type: string
 *                 description: Star Wars era (e.g., "Imperial Era", "High Republic")
 *               atmosphere:
 *                 type: string
 *                 description: Desired atmosphere/mood (e.g., "Tense", "Mysterious")
 *               sessionId:
 *                 type: string
 *                 description: Optional session ID to associate the generated content with
 *     responses:
 *       200:
 *         description: Location generated successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Generation error
 */
router.post(
  '/location',
  auth,
  requirePermission(Permission.GENERATE_CONTENT),
  validate([
    body('planet').notEmpty().withMessage('Planet is required'),
    body('locationType').notEmpty().withMessage('Location type is required'),
    body('era').notEmpty().withMessage('Era is required')
  ]),
  generationController.generateLocation
);

/**
 * @swagger
 * /api/generate/narrative:
 *   post:
 *     summary: Generate narrative continuation
 *     description: Generate a continuation of the narrative based on context
 *     tags: [Generation]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - era
 *               - location
 *               - lastMessage
 *             properties:
 *               sessionId:
 *                 type: string
 *                 description: Optional session ID to associate the generated content with
 *               era:
 *                 type: string
 *                 description: Star Wars era (e.g., "Imperial Era", "High Republic")
 *               location:
 *                 type: string
 *                 description: Current location name
 *               sessionSummary:
 *                 type: string
 *                 description: Brief summary of the session so far
 *               recentEvents:
 *                 type: string
 *                 description: Recent events in the story
 *               currentScene:
 *                 type: string
 *                 description: Description of the current scene
 *               playerCharacters:
 *                 type: string
 *                 description: Description of player characters present
 *               npcsPresent:
 *                 type: string
 *                 description: Description of NPCs present
 *               lastMessage:
 *                 type: string
 *                 description: The last message in the conversation
 *     responses:
 *       200:
 *         description: Narrative generated successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Generation error
 */
router.post(
  '/narrative',
  auth,
  requirePermission(Permission.GENERATE_CONTENT),
  validate([
    body('era').notEmpty().withMessage('Era is required'),
    body('location').notEmpty().withMessage('Location is required'),
    body('lastMessage').notEmpty().withMessage('Last message is required')
  ]),
  generationController.generateNarrativeContinuation
);

/**
 * @swagger
 * /api/generate/dialogue:
 *   post:
 *     summary: Generate character dialogue
 *     description: Generate dialogue for a specific character in response to input
 *     tags: [Generation]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - characterName
 *               - playerInput
 *             properties:
 *               sessionId:
 *                 type: string
 *                 description: Optional session ID to associate the generated content with
 *               characterName:
 *                 type: string
 *                 description: Name of the character speaking
 *               species:
 *                 type: string
 *                 description: Species of the character
 *               occupation:
 *                 type: string
 *                 description: Character's occupation
 *               affiliation:
 *                 type: string
 *                 description: Character's faction or allegiance
 *               personality:
 *                 type: string
 *                 description: Character's personality traits
 *               speechPattern:
 *                 type: string
 *                 description: Character's speech pattern or mannerisms
 *               knowledge:
 *                 type: string
 *                 description: What the character knows about the situation
 *               emotionalState:
 *                 type: string
 *                 description: Character's current emotional state
 *               relationship:
 *                 type: string
 *                 description: Character's relationship to the player
 *               location:
 *                 type: string
 *                 description: Current location
 *               situation:
 *                 type: string
 *                 description: Current situation context
 *               topic:
 *                 type: string
 *                 description: Topic of conversation
 *               previousDialogue:
 *                 type: string
 *                 description: Previous dialogue in this conversation
 *               playerInput:
 *                 type: string
 *                 description: What the player said to the character
 *     responses:
 *       200:
 *         description: Dialogue generated successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Generation error
 */
router.post(
  '/dialogue',
  auth,
  requirePermission(Permission.GENERATE_CONTENT),
  validate([
    body('characterName').notEmpty().withMessage('Character name is required'),
    body('playerInput').notEmpty().withMessage('Player input is required')
  ]),
  generationController.generateDialogue
);

/**
 * @swagger
 * /api/generate/quest:
 *   post:
 *     summary: Generate a quest
 *     description: Generate a Star Wars quest or adventure
 *     tags: [Generation]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - era
 *               - questType
 *               - difficulty
 *             properties:
 *               sessionId:
 *                 type: string
 *                 description: Optional session ID to associate the generated content with
 *               era:
 *                 type: string
 *                 description: Star Wars era (e.g., "Imperial Era", "High Republic")
 *               location:
 *                 type: string
 *                 description: Primary location for the quest
 *               theme:
 *                 type: string
 *                 description: Theme of the quest (e.g., "Rescue Mission", "Heist")
 *               plotStatus:
 *                 type: string
 *                 description: Current status of the campaign plot
 *               playerCharacters:
 *                 type: string
 *                 description: Description of player characters
 *               notableNpcs:
 *                 type: string
 *                 description: Notable NPCs in the campaign
 *               previousAdventures:
 *                 type: string
 *                 description: Summary of previous adventures
 *               questType:
 *                 type: string
 *                 description: Type of quest (e.g., "Combat", "Infiltration", "Investigation")
 *               difficulty:
 *                 type: string
 *                 description: Difficulty level (e.g., "Easy", "Medium", "Hard")
 *               duration:
 *                 type: string
 *                 description: Expected duration (e.g., "One session", "Multi-session")
 *               requiredHooks:
 *                 type: string
 *                 description: Any specific hooks that should be included
 *               restrictions:
 *                 type: string
 *                 description: Elements to avoid in the quest
 *     responses:
 *       200:
 *         description: Quest generated successfully
 *       400:
 *         description: Validation error
 *       500:
 *         description: Generation error
 */
router.post(
  '/quest',
  auth,
  requirePermission(Permission.ADVANCED_GENERATION),
  validate([
    body('era').notEmpty().withMessage('Era is required'),
    body('questType').notEmpty().withMessage('Quest type is required'),
    body('difficulty').notEmpty().withMessage('Difficulty is required')
  ]),
  generationController.generateQuest
);

/**
 * @swagger
 * /api/generate/stream:
 *   post:
 *     summary: Generate streaming text completion
 *     description: Generate text completion with streaming response
 *     tags: [Generation]
 *     security:
 *       - bearerAuth: []
 *       - apiKey: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - messages
 *             properties:
 *               messages:
 *                 type: array
 *                 description: Array of chat messages
 *                 items:
 *                   type: object
 *                   properties:
 *                     role:
 *                       type: string
 *                       enum: [system, user, assistant]
 *                     content:
 *                       type: string
 *               model:
 *                 type: string
 *                 description: Model to use for generation
 *               temperature:
 *                 type: number
 *                 description: Temperature for generation (0.0-1.0)
 *               max_tokens:
 *                 type: number
 *                 description: Maximum tokens to generate
 *     responses:
 *       200:
 *         description: Streaming response
 *         content:
 *           text/event-stream:
 *             schema:
 *               type: string
 *       400:
 *         description: Validation error
 *       500:
 *         description: Generation error
 */
router.post(
  '/stream',
  auth,
  requirePermission(Permission.GENERATE_CONTENT),
  validate([
    body('messages').isArray().withMessage('Messages must be an array'),
    body('messages.*.role').isIn(['system', 'user', 'assistant']).withMessage('Role must be system, user, or assistant'),
    body('messages.*.content').notEmpty().withMessage('Content is required')
  ]),
  generationController.streamCompletion
);

/**
 * @swagger
 * /api/generate/test:
 *   post:
 *     summary: Test narrative generation (no auth required)
 *     description: Test endpoint for narrative generation without authentication
 *     tags: [Generation]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - era
 *               - location
 *               - lastMessage
 *             properties:
 *               era:
 *                 type: string
 *               location:
 *                 type: string
 *               lastMessage:
 *                 type: string
 *     responses:
 *       200:
 *         description: Narrative generated successfully
 */
router.post(
  '/test',
  validate([
    body('era').notEmpty().withMessage('Era is required'),
    body('location').notEmpty().withMessage('Location is required'),
    body('lastMessage').notEmpty().withMessage('Last message is required')
  ]),
  generationController.generateNarrativeContinuation
);

export default router;