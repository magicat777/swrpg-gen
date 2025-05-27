const express = require('express');
const storyController = require('../controllers/storyController');

const router = express.Router();

/**
 * @route   POST /api/story/generate
 * @desc    Generate story content based on prompt and context
 * @access  Private
 */
router.post('/generate', storyController.generateStoryContent);

/**
 * @route   POST /api/story/analyze
 * @desc    Analyze story content for entities and events
 * @access  Private
 */
router.post('/analyze', storyController.analyzeStoryContent);

/**
 * @route   GET /api/story/similar
 * @desc    Find similar story events
 * @access  Private
 */
router.get('/similar', storyController.findSimilarEvents);

/**
 * @route   POST /api/story/character
 * @desc    Generate a new NPC character
 * @access  Private
 */
router.post('/character', storyController.generateCharacter);

/**
 * @route   POST /api/story/location
 * @desc    Generate a new location
 * @access  Private
 */
router.post('/location', storyController.generateLocation);

/**
 * @route   POST /api/story/quest
 * @desc    Generate a new quest or mission
 * @access  Private
 */
router.post('/quest', storyController.generateQuest);

/**
 * @route   GET /api/story/templates
 * @desc    Get available story templates
 * @access  Private
 */
router.get('/templates', storyController.getStoryTemplates);

/**
 * @route   POST /api/story/templates
 * @desc    Create a new story template
 * @access  Private
 */
router.post('/templates', storyController.createStoryTemplate);

module.exports = router;