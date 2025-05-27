const express = require('express');
const sessionController = require('../controllers/sessionController');

const router = express.Router();

/**
 * @route   GET /api/sessions
 * @desc    Get all sessions for a user
 * @access  Private
 */
router.get('/', sessionController.getSessions);

/**
 * @route   GET /api/sessions/:id
 * @desc    Get a session by ID
 * @access  Private
 */
router.get('/:id', sessionController.getSessionById);

/**
 * @route   POST /api/sessions
 * @desc    Create a new session
 * @access  Private
 */
router.post('/', sessionController.createSession);

/**
 * @route   PUT /api/sessions/:id
 * @desc    Update a session
 * @access  Private
 */
router.put('/:id', sessionController.updateSession);

/**
 * @route   DELETE /api/sessions/:id
 * @desc    Delete a session
 * @access  Private
 */
router.delete('/:id', sessionController.deleteSession);

/**
 * @route   GET /api/sessions/:id/messages
 * @desc    Get messages for a session
 * @access  Private
 */
router.get('/:id/messages', sessionController.getSessionMessages);

/**
 * @route   POST /api/sessions/:id/messages
 * @desc    Add a message to a session
 * @access  Private
 */
router.post('/:id/messages', sessionController.addSessionMessage);

/**
 * @route   GET /api/sessions/:id/state
 * @desc    Get current state for a session
 * @access  Private
 */
router.get('/:id/state', sessionController.getSessionState);

/**
 * @route   POST /api/sessions/:id/state
 * @desc    Create a new state snapshot for a session
 * @access  Private
 */
router.post('/:id/state', sessionController.createSessionState);

module.exports = router;