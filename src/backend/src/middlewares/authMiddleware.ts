import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { logger } from '../utils/logger';
import { AppError } from './errorHandler';

// Extend Express Request type to include user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        username: string;
        email: string;
        roles: string[];
      };
    }
  }
}

/**
 * Middleware to authenticate users using JWT
 */
export const authenticateJWT = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      throw new AppError('No authentication token provided', 401, 'UNAUTHORIZED');
    }

    // Extract the token
    const tokenParts = authHeader.split(' ');
    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
      throw new AppError('Invalid authorization format', 401, 'UNAUTHORIZED');
    }
    
    const token = tokenParts[1];
    
    // Verify the token
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      logger.error('JWT_SECRET environment variable not set');
      throw new AppError('Authorization service misconfigured', 500, 'SERVER_ERROR');
    }

    // Validate and decode the token
    const decoded = jwt.verify(token, secret) as {
      id: string;
      username: string;
      email: string;
      roles: string[];
    };

    // Add user info to request object
    req.user = decoded;
    next();
  } catch (error) {
    // Handle specific JWT errors
    if (error instanceof jwt.JsonWebTokenError) {
      return next(new AppError('Invalid token', 401, 'UNAUTHORIZED'));
    } else if (error instanceof jwt.TokenExpiredError) {
      return next(new AppError('Token expired', 401, 'TOKEN_EXPIRED'));
    } else if (error instanceof jwt.NotBeforeError) {
      return next(new AppError('Token not active', 401, 'TOKEN_NOT_ACTIVE'));
    }
    
    // Pass other errors to the error handler
    next(error);
  }
};

/**
 * Middleware to check if user has required roles
 */
export const authorizeRoles = (allowedRoles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      if (!req.user) {
        throw new AppError('Authentication required', 401, 'UNAUTHORIZED');
      }

      const hasRole = req.user.roles.some(role => allowedRoles.includes(role));
      
      if (!hasRole) {
        throw new AppError('Insufficient permissions', 403, 'FORBIDDEN');
      }
      
      next();
    } catch (error) {
      next(error);
    }
  };
};

/**
 * Middleware to authenticate API keys
 */
export const authenticateApiKey = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const apiKey = req.headers['x-api-key'] as string;

    if (!apiKey) {
      throw new AppError('No API key provided', 401, 'UNAUTHORIZED');
    }

    // In a real implementation, we would verify the API key against the database
    // For now, we'll use an environment variable for a simple check
    const validApiKey = process.env.API_KEY;
    
    if (!validApiKey) {
      logger.error('API_KEY environment variable not set');
      throw new AppError('API key service misconfigured', 500, 'SERVER_ERROR');
    }

    if (apiKey !== validApiKey) {
      throw new AppError('Invalid API key', 401, 'UNAUTHORIZED');
    }

    // API key is valid, proceed
    next();
  } catch (error) {
    next(error);
  }
};

/**
 * Optional authentication middleware
 * Will authenticate if token is present, but will not require it
 */
export const optionalAuthenticateJWT = async (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  try {
    const authHeader = req.headers.authorization;

    // If no auth header, continue without authentication
    if (!authHeader) {
      return next();
    }

    // Extract the token
    const tokenParts = authHeader.split(' ');
    if (tokenParts.length !== 2 || tokenParts[0] !== 'Bearer') {
      return next();
    }
    
    const token = tokenParts[1];
    
    // Verify the token
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      logger.warn('JWT_SECRET environment variable not set for optional auth');
      return next();
    }

    // Validate and decode the token
    try {
      const decoded = jwt.verify(token, secret) as {
        id: string;
        username: string;
        email: string;
        roles: string[];
      };

      // Add user info to request object
      req.user = decoded;
    } catch (error) {
      // Token is invalid, but this is optional auth so continue
      logger.debug('Optional auth failed', { error });
    }
    
    next();
  } catch (error) {
    // In optional auth, we don't want to stop the request for auth errors
    logger.error('Unexpected error in optional authentication', { error });
    next();
  }
};