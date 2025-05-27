import { Request, Response, NextFunction } from 'express';
import { AppError } from '../middlewares/errorHandler';
import { logger } from '../utils/logger';
import mongodbService from '../services/mongodbService';
import { UserRole, Permission, getUserPermissions, getHighestRole } from '../middlewares/roleAuthMiddleware';
import { ObjectId } from 'mongodb';

/**
 * Controller for administrative functions
 */
class AdminController {
  /**
   * Get all users with their roles and status
   */
  async getUsers(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { page = 1, limit = 20, role, status, search } = req.query;
      const skip = (Number(page) - 1) * Number(limit);
      
      const usersCollection = mongodbService.getUsersCollection();
      
      // Build query filter
      const filter: any = {};
      
      if (role) {
        filter.roles = { $in: [role] };
      }
      
      if (status) {
        filter.status = status;
      }
      
      if (search) {
        filter.$or = [
          { username: { $regex: search, $options: 'i' } },
          { email: { $regex: search, $options: 'i' } }
        ];
      }

      // Get users with pagination
      const users = await usersCollection.find(filter)
        .project({
          passwordHash: 0, // Exclude password hash
          apiKey: 0 // Exclude API key
        })
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(Number(limit))
        .toArray();

      // Get total count for pagination
      const totalUsers = await usersCollection.countDocuments(filter);
      
      // Calculate user statistics
      const userStats = await this.getUserStatistics();

      res.status(200).json({
        status: 'success',
        data: {
          users: users.map(user => ({
            id: user._id.toString(),
            username: user.username,
            email: user.email,
            roles: user.roles || ['user'],
            status: user.status || 'active',
            createdAt: user.createdAt,
            lastActive: user.lastActive,
            sessionCount: user.sessionHistory?.length || 0
          })),
          pagination: {
            currentPage: Number(page),
            totalPages: Math.ceil(totalUsers / Number(limit)),
            totalUsers,
            limit: Number(limit)
          },
          statistics: userStats
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get detailed information about a specific user
   */
  async getUser(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      
      if (!ObjectId.isValid(userId)) {
        throw new AppError('Invalid user ID', 400, 'INVALID_USER_ID');
      }

      const usersCollection = mongodbService.getUsersCollection();
      const user = await usersCollection.findOne(
        { _id: new ObjectId(userId) },
        { projection: { passwordHash: 0, apiKey: 0 } }
      );

      if (!user) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }

      // Get user's session history
      const sessionsCollection = mongodbService.getSessionsCollection();
      const sessionCount = await sessionsCollection.countDocuments({ userId: new ObjectId(userId) });

      // Get user's recent activity
      const recentSessions = await sessionsCollection.find({ userId: new ObjectId(userId) })
        .sort({ createdAt: -1 })
        .limit(5)
        .toArray();

      const userPermissions = getUserPermissions(user.roles || ['user']);

      res.status(200).json({
        status: 'success',
        data: {
          user: {
            id: user._id.toString(),
            username: user.username,
            email: user.email,
            roles: user.roles || ['user'],
            status: user.status || 'active',
            createdAt: user.createdAt,
            lastActive: user.lastActive,
            preferences: user.preferences,
            sessionCount,
            permissions: userPermissions,
            highestRole: getHighestRole(user.roles || ['user'])
          },
          recentActivity: recentSessions.map(session => ({
            sessionId: session._id.toString(),
            title: session.title,
            createdAt: session.createdAt,
            lastUpdated: session.lastUpdated
          }))
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update a user's roles
   */
  async updateUserRoles(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      const { roles } = req.body;

      if (!ObjectId.isValid(userId)) {
        throw new AppError('Invalid user ID', 400, 'INVALID_USER_ID');
      }

      if (!Array.isArray(roles) || roles.length === 0) {
        throw new AppError('Roles must be a non-empty array', 400, 'INVALID_ROLES');
      }

      // Validate roles
      const validRoles = Object.values(UserRole);
      for (const role of roles) {
        if (!validRoles.includes(role)) {
          throw new AppError(`Invalid role: ${role}`, 400, 'INVALID_ROLE');
        }
      }

      // Prevent self-demotion from super_admin
      if (req.user?.id === userId) {
        const currentUser = req.user;
        if (currentUser.roles.includes(UserRole.SUPER_ADMIN) && !roles.includes(UserRole.SUPER_ADMIN)) {
          throw new AppError('Cannot remove super_admin role from yourself', 400, 'SELF_DEMOTION_DENIED');
        }
      }

      const usersCollection = mongodbService.getUsersCollection();
      
      const result = await usersCollection.updateOne(
        { _id: new ObjectId(userId) },
        { 
          $set: { 
            roles,
            updatedAt: new Date(),
            updatedBy: req.user?.id
          }
        }
      );

      if (!result.acknowledged || result.matchedCount === 0) {
        throw new AppError('User not found or update failed', 404, 'UPDATE_FAILED');
      }

      // Log the role change
      logger.info('User roles updated', {
        targetUserId: userId,
        newRoles: roles,
        updatedBy: req.user?.id,
        updatedByUsername: req.user?.username
      });

      res.status(200).json({
        status: 'success',
        message: 'User roles updated successfully',
        data: {
          userId,
          newRoles: roles,
          permissions: getUserPermissions(roles)
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update a user's status (active, suspended, banned)
   */
  async updateUserStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { userId } = req.params;
      const { status, reason } = req.body;

      if (!ObjectId.isValid(userId)) {
        throw new AppError('Invalid user ID', 400, 'INVALID_USER_ID');
      }

      const validStatuses = ['active', 'suspended', 'banned'];
      if (!validStatuses.includes(status)) {
        throw new AppError('Invalid status. Must be: active, suspended, or banned', 400, 'INVALID_STATUS');
      }

      // Prevent self-suspension/banning
      if (req.user?.id === userId && status !== 'active') {
        throw new AppError('Cannot suspend or ban yourself', 400, 'SELF_ACTION_DENIED');
      }

      const usersCollection = mongodbService.getUsersCollection();
      
      const updateData: any = {
        status,
        updatedAt: new Date(),
        updatedBy: req.user?.id
      };

      if (reason) {
        updateData.statusReason = reason;
      }

      const result = await usersCollection.updateOne(
        { _id: new ObjectId(userId) },
        { $set: updateData }
      );

      if (!result.acknowledged || result.matchedCount === 0) {
        throw new AppError('User not found or update failed', 404, 'UPDATE_FAILED');
      }

      // Log the status change
      logger.info('User status updated', {
        targetUserId: userId,
        newStatus: status,
        reason,
        updatedBy: req.user?.id,
        updatedByUsername: req.user?.username
      });

      res.status(200).json({
        status: 'success',
        message: 'User status updated successfully',
        data: {
          userId,
          newStatus: status,
          reason
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get system statistics
   */
  async getSystemStats(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const usersCollection = mongodbService.getUsersCollection();
      const sessionsCollection = mongodbService.getSessionsCollection();
      const messagesCollection = mongodbService.getMessagesCollection();

      // Get user statistics
      const userStats = await this.getUserStatistics();

      // Get session statistics
      const totalSessions = await sessionsCollection.countDocuments();
      const activeSessions = await sessionsCollection.countDocuments({
        lastUpdated: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) } // Last 24 hours
      });

      // Get message statistics
      const totalMessages = await messagesCollection.countDocuments();
      const todaysMessages = await messagesCollection.countDocuments({
        timestamp: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) }
      });

      // Get top users by activity
      const topUsers = await sessionsCollection.aggregate([
        { $group: { _id: '$userId', sessionCount: { $sum: 1 } } },
        { $sort: { sessionCount: -1 } },
        { $limit: 10 },
        {
          $lookup: {
            from: 'users',
            localField: '_id',
            foreignField: '_id',
            as: 'user'
          }
        },
        { $unwind: '$user' },
        {
          $project: {
            userId: '$_id',
            username: '$user.username',
            sessionCount: 1
          }
        }
      ]).toArray();

      res.status(200).json({
        status: 'success',
        data: {
          users: userStats,
          sessions: {
            total: totalSessions,
            active: activeSessions,
            averagePerUser: userStats.totalUsers > 0 ? Math.round(totalSessions / userStats.totalUsers) : 0
          },
          messages: {
            total: totalMessages,
            today: todaysMessages,
            averagePerSession: totalSessions > 0 ? Math.round(totalMessages / totalSessions) : 0
          },
          topUsers: topUsers.map(user => ({
            userId: user.userId?.toString(),
            username: user.username,
            sessionCount: user.sessionCount
          })),
          timestamp: new Date().toISOString()
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get available roles and permissions
   */
  async getRolesAndPermissions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const roles = Object.values(UserRole).map(role => ({
        role,
        permissions: getUserPermissions([role])
      }));

      const permissions = Object.values(Permission);

      res.status(200).json({
        status: 'success',
        data: {
          roles,
          permissions,
          roleHierarchy: [
            UserRole.SUPER_ADMIN,
            UserRole.ADMIN,
            UserRole.MODERATOR,
            UserRole.PREMIUM,
            UserRole.USER,
            UserRole.GUEST
          ]
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Helper method to get user statistics
   */
  private async getUserStatistics() {
    const usersCollection = mongodbService.getUsersCollection();
    
    const totalUsers = await usersCollection.countDocuments();
    const activeUsers = await usersCollection.countDocuments({
      lastActive: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) } // Last 30 days
    });

    // Get role distribution
    const roleDistribution = await usersCollection.aggregate([
      { $unwind: { path: '$roles', preserveNullAndEmptyArrays: true } },
      {
        $group: {
          _id: { $ifNull: ['$roles', 'user'] },
          count: { $sum: 1 }
        }
      },
      { $sort: { count: -1 } }
    ]).toArray();

    // Get status distribution
    const statusDistribution = await usersCollection.aggregate([
      {
        $group: {
          _id: { $ifNull: ['$status', 'active'] },
          count: { $sum: 1 }
        }
      }
    ]).toArray();

    return {
      totalUsers,
      activeUsers,
      roleDistribution: roleDistribution.map(item => ({
        role: item._id,
        count: item.count
      })),
      statusDistribution: statusDistribution.map(item => ({
        status: item._id,
        count: item.count
      }))
    };
  }
}

// Create and export singleton instance
export default new AdminController();