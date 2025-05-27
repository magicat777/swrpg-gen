import express from 'express';
import { body, param, query } from 'express-validator';
import adminController from '../controllers/adminController';
import { validate } from '../middlewares/validationMiddleware';
import { authenticateJWT } from '../middlewares/authMiddleware';
import { 
  requirePermission, 
  requireMinimumRole, 
  attachUserPermissions,
  UserRole,
  Permission 
} from '../middlewares/roleAuthMiddleware';

const router = express.Router();

// Apply authentication to all admin routes
router.use(authenticateJWT);
router.use(attachUserPermissions);

/**
 * @swagger
 * /api/admin/users:
 *   get:
 *     summary: Get all users (Admin only)
 *     description: Retrieve a paginated list of all users with their roles and status
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: page
 *         schema:
 *           type: integer
 *           default: 1
 *         description: Page number for pagination
 *       - in: query
 *         name: limit
 *         schema:
 *           type: integer
 *           default: 20
 *         description: Number of users per page
 *       - in: query
 *         name: role
 *         schema:
 *           type: string
 *         description: Filter by user role
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *           enum: [active, suspended, banned]
 *         description: Filter by user status
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *         description: Search by username or email
 *     responses:
 *       200:
 *         description: Users retrieved successfully
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
 *                     users:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           id:
 *                             type: string
 *                           username:
 *                             type: string
 *                           email:
 *                             type: string
 *                           roles:
 *                             type: array
 *                             items:
 *                               type: string
 *                           status:
 *                             type: string
 *                           createdAt:
 *                             type: string
 *                             format: date-time
 *                           lastActive:
 *                             type: string
 *                             format: date-time
 *                           sessionCount:
 *                             type: number
 *                     pagination:
 *                       type: object
 *                       properties:
 *                         currentPage:
 *                           type: number
 *                         totalPages:
 *                           type: number
 *                         totalUsers:
 *                           type: number
 *                         limit:
 *                           type: number
 *                     statistics:
 *                       type: object
 *       403:
 *         description: Insufficient permissions
 */
router.get(
  '/users',
  requirePermission(Permission.MANAGE_USERS),
  validate([
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('role').optional().isIn(Object.values(UserRole)),
    query('status').optional().isIn(['active', 'suspended', 'banned']),
    query('search').optional().isLength({ min: 1, max: 50 })
  ]),
  adminController.getUsers
);

/**
 * @swagger
 * /api/admin/users/{userId}:
 *   get:
 *     summary: Get user details (Admin only)
 *     description: Get detailed information about a specific user
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User details retrieved successfully
 *       404:
 *         description: User not found
 *       403:
 *         description: Insufficient permissions
 */
router.get(
  '/users/:userId',
  requirePermission(Permission.MANAGE_USERS),
  validate([
    param('userId').isMongoId().withMessage('Invalid user ID')
  ]),
  adminController.getUser
);

/**
 * @swagger
 * /api/admin/users/{userId}/roles:
 *   put:
 *     summary: Update user roles (Admin only)
 *     description: Update the roles assigned to a specific user
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - roles
 *             properties:
 *               roles:
 *                 type: array
 *                 items:
 *                   type: string
 *                   enum: [guest, user, premium, moderator, admin, super_admin]
 *                 description: Array of roles to assign to the user
 *     responses:
 *       200:
 *         description: User roles updated successfully
 *       400:
 *         description: Invalid roles provided
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: User not found
 */
router.put(
  '/users/:userId/roles',
  requirePermission(Permission.MANAGE_ROLES),
  validate([
    param('userId').isMongoId().withMessage('Invalid user ID'),
    body('roles').isArray({ min: 1 }).withMessage('Roles must be a non-empty array'),
    body('roles.*').isIn(Object.values(UserRole)).withMessage('Invalid role')
  ]),
  adminController.updateUserRoles
);

/**
 * @swagger
 * /api/admin/users/{userId}/status:
 *   put:
 *     summary: Update user status (Admin only)
 *     description: Update the status of a specific user (active, suspended, banned)
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 enum: [active, suspended, banned]
 *                 description: New status for the user
 *               reason:
 *                 type: string
 *                 description: Optional reason for the status change
 *     responses:
 *       200:
 *         description: User status updated successfully
 *       400:
 *         description: Invalid status provided
 *       403:
 *         description: Insufficient permissions
 *       404:
 *         description: User not found
 */
router.put(
  '/users/:userId/status',
  requirePermission(Permission.MANAGE_USERS),
  validate([
    param('userId').isMongoId().withMessage('Invalid user ID'),
    body('status').isIn(['active', 'suspended', 'banned']).withMessage('Invalid status'),
    body('reason').optional().isLength({ min: 1, max: 500 }).withMessage('Reason must be 1-500 characters')
  ]),
  adminController.updateUserStatus
);

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Get system statistics (Admin only)
 *     description: Get comprehensive system statistics including users, sessions, and activity
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: System statistics retrieved successfully
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
 *                     users:
 *                       type: object
 *                       properties:
 *                         totalUsers:
 *                           type: number
 *                         activeUsers:
 *                           type: number
 *                         roleDistribution:
 *                           type: array
 *                         statusDistribution:
 *                           type: array
 *                     sessions:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                         active:
 *                           type: number
 *                         averagePerUser:
 *                           type: number
 *                     messages:
 *                       type: object
 *                       properties:
 *                         total:
 *                           type: number
 *                         today:
 *                           type: number
 *                         averagePerSession:
 *                           type: number
 *                     topUsers:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           userId:
 *                             type: string
 *                           username:
 *                             type: string
 *                           sessionCount:
 *                             type: number
 *       403:
 *         description: Insufficient permissions
 */
router.get(
  '/stats',
  requirePermission(Permission.VIEW_SYSTEM_STATS),
  adminController.getSystemStats
);

/**
 * @swagger
 * /api/admin/roles:
 *   get:
 *     summary: Get available roles and permissions (Admin only)
 *     description: Get a list of all available roles and their associated permissions
 *     tags: [Admin]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Roles and permissions retrieved successfully
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
 *                     roles:
 *                       type: array
 *                       items:
 *                         type: object
 *                         properties:
 *                           role:
 *                             type: string
 *                           permissions:
 *                             type: array
 *                             items:
 *                               type: string
 *                     permissions:
 *                       type: array
 *                       items:
 *                         type: string
 *                     roleHierarchy:
 *                       type: array
 *                       items:
 *                         type: string
 *       403:
 *         description: Insufficient permissions
 */
router.get(
  '/roles',
  requireMinimumRole(UserRole.ADMIN),
  adminController.getRolesAndPermissions
);

export default router;