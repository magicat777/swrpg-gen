import express from 'express';
import { body, param } from 'express-validator';
import settingsController from '../controllers/settingsController';
import { validate } from '../middlewares/validationMiddleware';
import { authenticateJWT } from '../middlewares/authMiddleware';

const router = express.Router();

/**
 * @swagger
 * components:
 *   schemas:
 *     UserSettings:
 *       type: object
 *       properties:
 *         appearance:
 *           type: object
 *           properties:
 *             theme:
 *               type: string
 *               enum: [light, dark, auto]
 *             fontSize:
 *               type: string
 *               enum: [small, medium, large]
 *             sidebarCollapsed:
 *               type: boolean
 *         notifications:
 *           type: object
 *           properties:
 *             sessionUpdates:
 *               type: boolean
 *             storyGeneration:
 *               type: boolean
 *             systemAlerts:
 *               type: boolean
 *             emailNotifications:
 *               type: boolean
 *         privacy:
 *           type: object
 *           properties:
 *             dataSharing:
 *               type: boolean
 *             analytics:
 *               type: boolean
 *             crashReports:
 *               type: boolean
 *         generation:
 *           type: object
 *           properties:
 *             autoSave:
 *               type: boolean
 *             maxStoryLength:
 *               type: number
 *             defaultEra:
 *               type: string
 *             preferredComplexity:
 *               type: string
 *               enum: [simple, moderate, complex]
 */

/**
 * @swagger
 * /api/settings:
 *   get:
 *     summary: Get user settings
 *     description: Retrieve current user settings
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: User settings retrieved successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     settings:
 *                       $ref: '#/components/schemas/UserSettings'
 *       401:
 *         description: User not authenticated
 *       500:
 *         description: Server error
 */
router.get('/', authenticateJWT, settingsController.getUserSettings);

/**
 * @swagger
 * /api/settings:
 *   put:
 *     summary: Update user settings
 *     description: Update user settings (full or partial update)
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               settings:
 *                 $ref: '#/components/schemas/UserSettings'
 *     responses:
 *       200:
 *         description: Settings updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     settings:
 *                       $ref: '#/components/schemas/UserSettings'
 *                 message:
 *                   type: string
 *                   example: Settings updated successfully
 *       400:
 *         description: Invalid request data
 *       401:
 *         description: User not authenticated
 *       500:
 *         description: Server error
 */
router.put(
  '/',
  authenticateJWT,
  validate([
    body('settings')
      .isObject()
      .withMessage('Settings must be an object'),
    body('settings.appearance')
      .optional()
      .isObject()
      .withMessage('Appearance settings must be an object'),
    body('settings.appearance.theme')
      .optional()
      .isIn(['light', 'dark', 'auto'])
      .withMessage('Theme must be light, dark, or auto'),
    body('settings.appearance.fontSize')
      .optional()
      .isIn(['small', 'medium', 'large'])
      .withMessage('Font size must be small, medium, or large'),
    body('settings.notifications')
      .optional()
      .isObject()
      .withMessage('Notification settings must be an object'),
    body('settings.privacy')
      .optional()
      .isObject()
      .withMessage('Privacy settings must be an object'),
    body('settings.generation')
      .optional()
      .isObject()
      .withMessage('Generation settings must be an object')
  ]),
  settingsController.updateUserSettings
);

/**
 * @swagger
 * /api/settings/{category}:
 *   patch:
 *     summary: Update specific settings category
 *     description: Update a specific category of user settings (appearance, notifications, privacy, generation)
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: category
 *         required: true
 *         schema:
 *           type: string
 *           enum: [appearance, notifications, privacy, generation]
 *         description: The settings category to update
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             description: Category-specific settings to update
 *             examples:
 *               appearance:
 *                 summary: Update appearance settings
 *                 value:
 *                   theme: "dark"
 *                   fontSize: "large"
 *               notifications:
 *                 summary: Update notification settings
 *                 value:
 *                   sessionUpdates: true
 *                   emailNotifications: false
 *     responses:
 *       200:
 *         description: Category settings updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     settings:
 *                       $ref: '#/components/schemas/UserSettings'
 *                 message:
 *                   type: string
 *                   example: appearance settings updated successfully
 *       400:
 *         description: Invalid category or request data
 *       401:
 *         description: User not authenticated
 *       500:
 *         description: Server error
 */
router.patch(
  '/:category',
  authenticateJWT,
  validate([
    param('category')
      .isIn(['appearance', 'notifications', 'privacy', 'generation'])
      .withMessage('Category must be one of: appearance, notifications, privacy, generation'),
    body('settings')
      .isObject()
      .withMessage('Settings must be an object'),
    body('settings.*')
      .optional()
      .custom((value, { req }) => {
        // Additional validation based on category
        const category = req.params?.category;
        if (category === 'appearance') {
          // Validate appearance-specific fields
          return true;
        }
        return true;
      })
  ]),
  settingsController.updateSettingCategory
);

/**
 * @swagger
 * /api/settings/reset:
 *   post:
 *     summary: Reset user settings to defaults
 *     description: Reset all user settings to their default values
 *     tags: [Settings]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Settings reset successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 status:
 *                   type: string
 *                   example: success
 *                 data:
 *                   type: object
 *                   properties:
 *                     settings:
 *                       $ref: '#/components/schemas/UserSettings'
 *                 message:
 *                   type: string
 *                   example: Settings reset to defaults successfully
 *       401:
 *         description: User not authenticated
 *       500:
 *         description: Server error
 */
router.post('/reset', authenticateJWT, settingsController.resetUserSettings);

export default router;