import { Request, Response, NextFunction } from 'express';
import { AppError } from './errorHandler';
import { logger } from '../utils/logger';

/**
 * Define the role hierarchy and permissions
 */
export enum UserRole {
  GUEST = 'guest',
  USER = 'user',
  PREMIUM = 'premium',
  MODERATOR = 'moderator',
  ADMIN = 'admin',
  SUPER_ADMIN = 'super_admin'
}

export enum Permission {
  // Basic permissions
  READ_PUBLIC_CONTENT = 'read_public_content',
  CREATE_SESSION = 'create_session',
  GENERATE_CONTENT = 'generate_content',
  
  // Premium permissions
  ADVANCED_GENERATION = 'advanced_generation',
  BATCH_GENERATION = 'batch_generation',
  EXPORT_DATA = 'export_data',
  CUSTOM_TEMPLATES = 'custom_templates',
  
  // Moderation permissions
  VIEW_USER_ACTIVITY = 'view_user_activity',
  MODERATE_CONTENT = 'moderate_content',
  MANAGE_REPORTS = 'manage_reports',
  
  // Admin permissions
  MANAGE_USERS = 'manage_users',
  VIEW_SYSTEM_STATS = 'view_system_stats',
  CONFIGURE_SYSTEM = 'configure_system',
  
  // Super admin permissions
  MANAGE_ROLES = 'manage_roles',
  ACCESS_DATABASE = 'access_database',
  SYSTEM_MAINTENANCE = 'system_maintenance'
}

/**
 * Role to permissions mapping
 */
const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  [UserRole.GUEST]: [
    Permission.READ_PUBLIC_CONTENT
  ],
  [UserRole.USER]: [
    Permission.READ_PUBLIC_CONTENT,
    Permission.CREATE_SESSION,
    Permission.GENERATE_CONTENT
  ],
  [UserRole.PREMIUM]: [
    Permission.READ_PUBLIC_CONTENT,
    Permission.CREATE_SESSION,
    Permission.GENERATE_CONTENT,
    Permission.ADVANCED_GENERATION,
    Permission.BATCH_GENERATION,
    Permission.EXPORT_DATA,
    Permission.CUSTOM_TEMPLATES
  ],
  [UserRole.MODERATOR]: [
    Permission.READ_PUBLIC_CONTENT,
    Permission.CREATE_SESSION,
    Permission.GENERATE_CONTENT,
    Permission.VIEW_USER_ACTIVITY,
    Permission.MODERATE_CONTENT,
    Permission.MANAGE_REPORTS
  ],
  [UserRole.ADMIN]: [
    Permission.READ_PUBLIC_CONTENT,
    Permission.CREATE_SESSION,
    Permission.GENERATE_CONTENT,
    Permission.ADVANCED_GENERATION,
    Permission.VIEW_USER_ACTIVITY,
    Permission.MODERATE_CONTENT,
    Permission.MANAGE_REPORTS,
    Permission.MANAGE_USERS,
    Permission.VIEW_SYSTEM_STATS,
    Permission.CONFIGURE_SYSTEM
  ],
  [UserRole.SUPER_ADMIN]: [
    ...Object.values(Permission)
  ]
};

/**
 * Rate limits per role (requests per hour)
 */
const ROLE_RATE_LIMITS: Record<UserRole, number> = {
  [UserRole.GUEST]: 10,
  [UserRole.USER]: 100,
  [UserRole.PREMIUM]: 500,
  [UserRole.MODERATOR]: 1000,
  [UserRole.ADMIN]: 2000,
  [UserRole.SUPER_ADMIN]: Number.MAX_SAFE_INTEGER
};

/**
 * Token limits per role (max tokens per generation)
 */
const ROLE_TOKEN_LIMITS: Record<UserRole, number> = {
  [UserRole.GUEST]: 500,
  [UserRole.USER]: 2000,
  [UserRole.PREMIUM]: 4000,
  [UserRole.MODERATOR]: 4000,
  [UserRole.ADMIN]: 8000,
  [UserRole.SUPER_ADMIN]: Number.MAX_SAFE_INTEGER
};

/**
 * Get the highest role from an array of roles
 */
export function getHighestRole(roles: string[]): UserRole {
  const roleHierarchy = [
    UserRole.SUPER_ADMIN,
    UserRole.ADMIN,
    UserRole.MODERATOR,
    UserRole.PREMIUM,
    UserRole.USER,
    UserRole.GUEST
  ];

  for (const role of roleHierarchy) {
    if (roles.includes(role)) {
      return role;
    }
  }

  return UserRole.GUEST;
}

/**
 * Check if a user has a specific permission
 */
export function hasPermission(userRoles: string[], permission: Permission): boolean {
  const highestRole = getHighestRole(userRoles);
  const rolePermissions = ROLE_PERMISSIONS[highestRole] || [];
  return rolePermissions.includes(permission);
}

/**
 * Get all permissions for a user's roles
 */
export function getUserPermissions(userRoles: string[]): Permission[] {
  const highestRole = getHighestRole(userRoles);
  return ROLE_PERMISSIONS[highestRole] || [];
}

/**
 * Get rate limit for a user's roles
 */
export function getRateLimit(userRoles: string[]): number {
  const highestRole = getHighestRole(userRoles);
  return ROLE_RATE_LIMITS[highestRole];
}

/**
 * Get token limit for a user's roles
 */
export function getTokenLimit(userRoles: string[]): number {
  const highestRole = getHighestRole(userRoles);
  return ROLE_TOKEN_LIMITS[highestRole];
}

/**
 * Middleware to require specific permissions
 */
export function requirePermission(permission: Permission) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // For guest access, treat as having guest role
      const userRoles = req.user?.roles || [UserRole.GUEST];
      
      if (!hasPermission(userRoles, permission)) {
        const highestRole = getHighestRole(userRoles);
        logger.warn('Permission denied', {
          userId: req.user?.id,
          userRoles,
          highestRole,
          requiredPermission: permission,
          endpoint: req.path
        });
        
        throw new AppError(
          `Insufficient permissions. Required: ${permission}`,
          403,
          'INSUFFICIENT_PERMISSIONS'
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Middleware to require any of the specified roles
 */
export function requireAnyRole(allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const userRoles = req.user?.roles || [UserRole.GUEST];
      const highestRole = getHighestRole(userRoles);
      
      if (!allowedRoles.includes(highestRole)) {
        logger.warn('Role access denied', {
          userId: req.user?.id,
          userRoles,
          highestRole,
          allowedRoles,
          endpoint: req.path
        });
        
        throw new AppError(
          `Access denied. Required roles: ${allowedRoles.join(', ')}`,
          403,
          'INSUFFICIENT_ROLE'
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Middleware to require minimum role level
 */
export function requireMinimumRole(minimumRole: UserRole) {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      const userRoles = req.user?.roles || [UserRole.GUEST];
      const highestRole = getHighestRole(userRoles);
      
      const roleHierarchy = [
        UserRole.SUPER_ADMIN,
        UserRole.ADMIN,
        UserRole.MODERATOR,
        UserRole.PREMIUM,
        UserRole.USER,
        UserRole.GUEST
      ];

      const userRoleIndex = roleHierarchy.indexOf(highestRole);
      const minimumRoleIndex = roleHierarchy.indexOf(minimumRole);

      if (userRoleIndex > minimumRoleIndex) {
        logger.warn('Minimum role requirement not met', {
          userId: req.user?.id,
          userRoles,
          highestRole,
          minimumRole,
          endpoint: req.path
        });
        
        throw new AppError(
          `Access denied. Minimum role required: ${minimumRole}`,
          403,
          'INSUFFICIENT_ROLE_LEVEL'
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
}

/**
 * Middleware to attach user permissions to request
 */
export function attachUserPermissions(req: Request, res: Response, next: NextFunction) {
  try {
    const userRoles = req.user?.roles || [UserRole.GUEST];
    const permissions = getUserPermissions(userRoles);
    const rateLimit = getRateLimit(userRoles);
    const tokenLimit = getTokenLimit(userRoles);
    const highestRole = getHighestRole(userRoles);

    // Extend the request object with permission info
    (req as any).userPermissions = {
      roles: userRoles,
      highestRole,
      permissions,
      rateLimit,
      tokenLimit,
      hasPermission: (permission: Permission) => hasPermission(userRoles, permission)
    };

    next();
  } catch (error) {
    next(error);
  }
}

/**
 * Utility function to check if user can perform an action
 */
export function canPerformAction(userRoles: string[], action: string): boolean {
  const actionPermissionMap: Record<string, Permission> = {
    'generate_character': Permission.GENERATE_CONTENT,
    'generate_location': Permission.GENERATE_CONTENT,
    'generate_quest': Permission.GENERATE_CONTENT,
    'advanced_generation': Permission.ADVANCED_GENERATION,
    'batch_generation': Permission.BATCH_GENERATION,
    'export_data': Permission.EXPORT_DATA,
    'manage_users': Permission.MANAGE_USERS,
    'view_system_stats': Permission.VIEW_SYSTEM_STATS,
    'moderate_content': Permission.MODERATE_CONTENT
  };

  const requiredPermission = actionPermissionMap[action];
  if (!requiredPermission) {
    return false;
  }

  return hasPermission(userRoles, requiredPermission);
}

/**
 * Express middleware to validate token limits for generation requests
 */
export function validateTokenLimit(req: Request, res: Response, next: NextFunction) {
  try {
    const userRoles = req.user?.roles || [UserRole.GUEST];
    const userTokenLimit = getTokenLimit(userRoles);
    
    // Check various token-related parameters in the request body
    const requestedTokens = req.body.maxTokens || req.body.max_tokens || 500;
    
    if (requestedTokens > userTokenLimit) {
      throw new AppError(
        `Token limit exceeded. Maximum allowed: ${userTokenLimit}, requested: ${requestedTokens}`,
        400,
        'TOKEN_LIMIT_EXCEEDED'
      );
    }

    next();
  } catch (error) {
    next(error);
  }
}