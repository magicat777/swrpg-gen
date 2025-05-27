import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { ObjectId } from 'mongodb';
import { AppError } from '../middlewares/errorHandler';
import { logger } from '../utils/logger';
import mongodbService from '../services/mongodbService';

/**
 * Controller for authentication functions
 */
class AuthController {
  /**
   * Register a new user
   */
  async register(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username, email, password } = req.body;

      // Get users collection
      const usersCollection = mongodbService.getUsersCollection();

      // Check if username already exists
      const existingUser = await usersCollection.findOne({ 
        $or: [{ username }, { email }] 
      });

      if (existingUser) {
        if (existingUser.username === username) {
          throw new AppError('Username already in use', 409, 'USERNAME_TAKEN');
        } else {
          throw new AppError('Email already in use', 409, 'EMAIL_TAKEN');
        }
      }

      // Hash the password
      const salt = crypto.randomBytes(16).toString('hex');
      const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');
      
      // Create the user
      const user = {
        username,
        email,
        passwordHash: `${salt}:${hash}`,
        createdAt: new Date(),
        lastActive: new Date(),
        preferences: {
          theme: 'dark',
          notificationsEnabled: true,
          defaultSettings: {
            era: 'Rebellion Era',
            locale: 'en-US',
            tonePreferences: ['immersive', 'detailed'],
            contentFilters: []
          }
        },
        characters: [],
        savedLocations: [],
        savedItems: [],
        sessionHistory: [],
        roles: ['user'], // Default role
        meta: {}
      };

      // Insert the user into the database
      const result = await usersCollection.insertOne(user);

      if (!result.acknowledged) {
        throw new AppError('Failed to create user', 500, 'DATABASE_ERROR');
      }

      // Create JWT token
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        throw new AppError('JWT secret not configured', 500, 'SERVER_ERROR');
      }

      const token = jwt.sign(
        { 
          id: result.insertedId.toString(),
          username: user.username,
          email: user.email,
          roles: user.roles
        },
        secret,
        { expiresIn: '24h' }
      );

      // Return the user and token
      res.status(201).json({
        status: 'success',
        data: {
          user: {
            id: result.insertedId.toString(),
            username: user.username,
            email: user.email,
            roles: user.roles,
            createdAt: user.createdAt
          },
          token
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Login a user
   */
  async login(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { username, password } = req.body;

      // Get users collection
      const usersCollection = mongodbService.getUsersCollection();

      // Find the user
      const user = await usersCollection.findOne({ username });

      if (!user) {
        throw new AppError('Invalid username or password', 401, 'INVALID_CREDENTIALS');
      }

      // Verify the password
      const [salt, storedHash] = user.passwordHash.split(':');
      const hash = crypto.pbkdf2Sync(password, salt, 10000, 64, 'sha512').toString('hex');

      if (storedHash !== hash) {
        throw new AppError('Invalid username or password', 401, 'INVALID_CREDENTIALS');
      }

      // Update last active time
      await usersCollection.updateOne(
        { _id: user._id },
        { $set: { lastActive: new Date() } }
      );

      // Create JWT token
      const secret = process.env.JWT_SECRET;
      if (!secret) {
        throw new AppError('JWT secret not configured', 500, 'SERVER_ERROR');
      }

      const token = jwt.sign(
        { 
          id: user._id.toString(),
          username: user.username,
          email: user.email,
          roles: user.roles || ['user']
        },
        secret,
        { expiresIn: '24h' }
      );

      // Return the user and token
      res.status(200).json({
        status: 'success',
        data: {
          user: {
            id: user._id.toString(),
            username: user.username,
            email: user.email,
            roles: user.roles || ['user']
          },
          token
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get the current user
   */
  async getMe(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Not authenticated', 401, 'UNAUTHORIZED');
      }

      // Get users collection
      const usersCollection = mongodbService.getUsersCollection();

      // Find the user
      const user = await usersCollection.findOne({ _id: new ObjectId(req.user.id) });

      if (!user) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }

      // Return the user
      res.status(200).json({
        status: 'success',
        data: {
          user: {
            id: user._id.toString(),
            username: user.username,
            email: user.email,
            roles: user.roles || ['user'],
            preferences: user.preferences,
            createdAt: user.createdAt,
            lastActive: user.lastActive
          }
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Generate an API key for a user
   */
  async generateApiKey(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Not authenticated', 401, 'UNAUTHORIZED');
      }

      // Get users collection
      const usersCollection = mongodbService.getUsersCollection();

      // Generate a new API key
      const apiKey = crypto.randomBytes(32).toString('hex');

      // Update the user with the new API key
      const result = await usersCollection.updateOne(
        { _id: req.user.id },
        { $set: { apiKey } }
      );

      if (!result.acknowledged) {
        throw new AppError('Failed to generate API key', 500, 'DATABASE_ERROR');
      }

      // Return the API key
      res.status(200).json({
        status: 'success',
        data: {
          apiKey
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Revoke a user's API key
   */
  async revokeApiKey(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Not authenticated', 401, 'UNAUTHORIZED');
      }

      // Get users collection
      const usersCollection = mongodbService.getUsersCollection();

      // Remove the API key
      const result = await usersCollection.updateOne(
        { _id: req.user.id },
        { $unset: { apiKey: "" } }
      );

      if (!result.acknowledged) {
        throw new AppError('Failed to revoke API key', 500, 'DATABASE_ERROR');
      }

      // Return success
      res.status(200).json({
        status: 'success',
        message: 'API key revoked successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update user preferences
   */
  async updatePreferences(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Not authenticated', 401, 'UNAUTHORIZED');
      }

      const { preferences } = req.body;

      if (!preferences || typeof preferences !== 'object') {
        throw new AppError('Preferences object is required', 400, 'INVALID_PREFERENCES');
      }

      // Get users collection
      const usersCollection = mongodbService.getUsersCollection();

      // Update user preferences
      const result = await usersCollection.updateOne(
        { _id: new ObjectId(req.user.id) },
        { 
          $set: { 
            preferences: preferences,
            updatedAt: new Date()
          }
        }
      );

      if (!result.acknowledged) {
        throw new AppError('Failed to update preferences', 500, 'DATABASE_ERROR');
      }

      // Get updated user data
      const updatedUser = await usersCollection.findOne({ _id: new ObjectId(req.user.id) });

      if (!updatedUser) {
        throw new AppError('User not found after update', 404, 'USER_NOT_FOUND');
      }

      // Return updated preferences
      res.status(200).json({
        status: 'success',
        data: {
          preferences: updatedUser.preferences
        }
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Change user password
   */
  async changePassword(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Not authenticated', 401, 'UNAUTHORIZED');
      }

      const { currentPassword, newPassword } = req.body;

      if (!currentPassword || !newPassword) {
        throw new AppError('Current password and new password are required', 400, 'MISSING_PASSWORDS');
      }

      if (newPassword.length < 6) {
        throw new AppError('New password must be at least 6 characters', 400, 'PASSWORD_TOO_SHORT');
      }

      // Get users collection
      const usersCollection = mongodbService.getUsersCollection();

      // Find the user
      const user = await usersCollection.findOne({ _id: new ObjectId(req.user.id) });

      if (!user) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }

      // Verify current password
      const [salt, storedHash] = user.passwordHash.split(':');
      const currentHash = crypto.pbkdf2Sync(currentPassword, salt, 10000, 64, 'sha512').toString('hex');

      if (storedHash !== currentHash) {
        throw new AppError('Current password is incorrect', 401, 'INVALID_PASSWORD');
      }

      // Hash the new password
      const newSalt = crypto.randomBytes(16).toString('hex');
      const newHash = crypto.pbkdf2Sync(newPassword, newSalt, 10000, 64, 'sha512').toString('hex');

      // Update the password
      const result = await usersCollection.updateOne(
        { _id: new ObjectId(req.user.id) },
        { 
          $set: { 
            passwordHash: `${newSalt}:${newHash}`,
            updatedAt: new Date()
          }
        }
      );

      if (!result.acknowledged) {
        throw new AppError('Failed to update password', 500, 'DATABASE_ERROR');
      }

      logger.info(`Password changed for user: ${user.username}`);

      // Return success
      res.status(200).json({
        status: 'success',
        message: 'Password updated successfully'
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get user preferences
   */
  async getPreferences(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!req.user) {
        throw new AppError('Not authenticated', 401, 'UNAUTHORIZED');
      }

      // Get users collection
      const usersCollection = mongodbService.getUsersCollection();

      // Find the user
      const user = await usersCollection.findOne({ _id: new ObjectId(req.user.id) });

      if (!user) {
        throw new AppError('User not found', 404, 'USER_NOT_FOUND');
      }

      // Return user preferences
      res.status(200).json({
        status: 'success',
        data: {
          preferences: user.preferences || {}
        }
      });
    } catch (error) {
      next(error);
    }
  }
}

// Create and export singleton instance
export default new AuthController();