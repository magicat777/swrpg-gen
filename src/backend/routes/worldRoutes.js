const express = require('express');
const worldController = require('../controllers/worldController');

const router = express.Router();

/**
 * @route   GET /api/world/characters
 * @desc    Get characters matching query parameters
 * @access  Private
 */
router.get('/characters', worldController.getCharacters);

/**
 * @route   GET /api/world/characters/:id
 * @desc    Get a character by ID
 * @access  Private
 */
router.get('/characters/:id', worldController.getCharacterById);

/**
 * @route   POST /api/world/characters
 * @desc    Create a new character
 * @access  Private
 */
router.post('/characters', worldController.createCharacter);

/**
 * @route   PUT /api/world/characters/:id
 * @desc    Update a character
 * @access  Private
 */
router.put('/characters/:id', worldController.updateCharacter);

/**
 * @route   GET /api/world/locations
 * @desc    Get locations matching query parameters
 * @access  Private
 */
router.get('/locations', worldController.getLocations);

/**
 * @route   GET /api/world/locations/:id
 * @desc    Get a location by ID
 * @access  Private
 */
router.get('/locations/:id', worldController.getLocationById);

/**
 * @route   POST /api/world/locations
 * @desc    Create a new location
 * @access  Private
 */
router.post('/locations', worldController.createLocation);

/**
 * @route   GET /api/world/factions
 * @desc    Get factions matching query parameters
 * @access  Private
 */
router.get('/factions', worldController.getFactions);

/**
 * @route   GET /api/world/factions/:id
 * @desc    Get a faction by ID
 * @access  Private
 */
router.get('/factions/:id', worldController.getFactionById);

/**
 * @route   GET /api/world/items
 * @desc    Get items matching query parameters
 * @access  Private
 */
router.get('/items', worldController.getItems);

/**
 * @route   GET /api/world/items/:id
 * @desc    Get an item by ID
 * @access  Private
 */
router.get('/items/:id', worldController.getItemById);

/**
 * @route   GET /api/world/events
 * @desc    Get events matching query parameters
 * @access  Private
 */
router.get('/events', worldController.getEvents);

/**
 * @route   GET /api/world/events/:id
 * @desc    Get an event by ID
 * @access  Private
 */
router.get('/events/:id', worldController.getEventById);

/**
 * @route   GET /api/world/knowledge
 * @desc    Search world knowledge
 * @access  Private
 */
router.get('/knowledge', worldController.searchWorldKnowledge);

/**
 * @route   POST /api/world/knowledge
 * @desc    Add new world knowledge
 * @access  Private
 */
router.post('/knowledge', worldController.addWorldKnowledge);

/**
 * @route   GET /api/world/relationship
 * @desc    Find relationships between entities
 * @access  Private
 */
router.get('/relationship', worldController.findRelationships);

module.exports = router;