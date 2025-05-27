import express from 'express';
import { query } from 'express-validator';
import worldController from '../controllers/worldController';
import { validate } from '../middlewares/validationMiddleware';
import { optionalAuthenticateJWT } from '../middlewares/authMiddleware';

const router = express.Router();

/**
 * Optional authentication middleware for world browsing
 */
const optionalAuth = [
  optionalAuthenticateJWT
];

/**
 * @swagger
 * /api/world/characters:
 *   get:
 *     summary: Get Star Wars characters
 *     description: Retrieve Star Wars characters from the database
 *     tags: [World Data]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of characters to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Number of characters to skip
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for character names
 *       - in: query
 *         name: species
 *         schema:
 *           type: string
 *         description: Filter by species
 *       - in: query
 *         name: affiliation
 *         schema:
 *           type: string
 *         description: Filter by affiliation
 *     responses:
 *       200:
 *         description: List of characters
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 total:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 offset:
 *                   type: integer
 */
router.get(
  '/characters',
  optionalAuth,
  validate([
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be non-negative'),
    query('search').optional().isString().withMessage('Search must be a string'),
    query('species').optional().isString().withMessage('Species must be a string'),
    query('affiliation').optional().isString().withMessage('Affiliation must be a string')
  ]),
  worldController.getCharacters
);

/**
 * @swagger
 * /api/world/characters/{id}:
 *   get:
 *     summary: Get character by ID
 *     description: Retrieve a specific character by ID
 *     tags: [World Data]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Character ID
 *     responses:
 *       200:
 *         description: Character details
 *       404:
 *         description: Character not found
 */
router.get(
  '/characters/:id',
  optionalAuth,
  worldController.getCharacterById
);

/**
 * @swagger
 * /api/world/locations:
 *   get:
 *     summary: Get Star Wars locations
 *     description: Retrieve Star Wars locations from the database
 *     tags: [World Data]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of locations to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Number of locations to skip
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for location names
 *       - in: query
 *         name: planet
 *         schema:
 *           type: string
 *         description: Filter by planet
 *       - in: query
 *         name: climate
 *         schema:
 *           type: string
 *         description: Filter by climate
 *     responses:
 *       200:
 *         description: List of locations
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 data:
 *                   type: array
 *                   items:
 *                     type: object
 *                 total:
 *                   type: integer
 *                 limit:
 *                   type: integer
 *                 offset:
 *                   type: integer
 */
router.get(
  '/locations',
  optionalAuth,
  validate([
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be non-negative'),
    query('search').optional().isString().withMessage('Search must be a string'),
    query('planet').optional().isString().withMessage('Planet must be a string'),
    query('climate').optional().isString().withMessage('Climate must be a string')
  ]),
  worldController.getLocations
);

/**
 * @swagger
 * /api/world/locations/{id}:
 *   get:
 *     summary: Get location by ID
 *     description: Retrieve a specific location by ID
 *     tags: [World Data]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Location ID
 *     responses:
 *       200:
 *         description: Location details
 *       404:
 *         description: Location not found
 */
router.get(
  '/locations/:id',
  optionalAuth,
  worldController.getLocationById
);

/**
 * @swagger
 * /api/world/factions:
 *   get:
 *     summary: Get Star Wars factions
 *     description: Retrieve Star Wars factions from the database
 *     tags: [World Data]
 *     parameters:
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           minimum: 1
 *           maximum: 100
 *           default: 20
 *         description: Number of factions to return
 *       - in: query
 *         name: offset
 *         schema:
 *           type: integer
 *           minimum: 0
 *           default: 0
 *         description: Number of factions to skip
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search term for faction names
 *       - in: query
 *         name: era
 *         schema:
 *           type: string
 *         description: Filter by era
 *     responses:
 *       200:
 *         description: List of factions
 */
router.get(
  '/factions',
  optionalAuth,
  validate([
    query('limit').optional().isInt({ min: 1, max: 100 }).withMessage('Limit must be between 1 and 100'),
    query('offset').optional().isInt({ min: 0 }).withMessage('Offset must be non-negative'),
    query('search').optional().isString().withMessage('Search must be a string'),
    query('era').optional().isString().withMessage('Era must be a string')
  ]),
  worldController.getFactions
);

/**
 * @swagger
 * /api/world/factions/{id}:
 *   get:
 *     summary: Get faction by ID
 *     description: Retrieve a specific faction by ID
 *     tags: [World Data]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: Faction ID
 *     responses:
 *       200:
 *         description: Faction details
 *       404:
 *         description: Faction not found
 */
router.get(
  '/factions/:id',
  optionalAuth,
  worldController.getFactionById
);

export default router;