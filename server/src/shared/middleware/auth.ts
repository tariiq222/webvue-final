/**
 * 🔐 Authentication Middleware
 * وسطية المصادقة
 * 
 * Middleware for JWT authentication and user verification.
 */

import { Request, Response, NextFunction } from 'express';
import { prisma } from '@/database/connection';
import { verifyAccessToken, extractTokenFromHeader } from '@/shared/utils/jwt';
import { AppError, asyncHandler } from '@/shared/middleware/errorHandler';
import { logger } from '@/shared/utils/logger';

/**
 * Authenticate user with JWT token
 * مصادقة المستخدم باستخدام رمز JWT
 */
export const authenticate = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  // Extract token from Authorization header
  const token = extractTokenFromHeader(req.headers.authorization);
  
  if (!token) {
    throw new AppError('Access token required', 401, 'TOKEN_REQUIRED');
  }

  // Verify token
  const payload = verifyAccessToken(token);

  // Get user from database with roles and permissions
  const user = await prisma.user.findUnique({
    where: { id: payload.userId },
    include: {
      userRoles: {
        include: {
          role: {
            include: {
              rolePermissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      },
    },
  });

  if (!user) {
    throw new AppError('User not found', 401, 'USER_NOT_FOUND');
  }

  if (!user.isActive) {
    throw new AppError('Account is deactivated', 401, 'ACCOUNT_DEACTIVATED');
  }

  // Extract roles
  const roles = user.userRoles.map(ur => ur.role.name);

  // Remove sensitive data
  const { password, twoFactorSecret, ...userWithoutSensitiveData } = user;

  // Attach user to request
  req.user = {
    ...userWithoutSensitiveData,
    roles: user.userRoles.map(ur => ur.role),
  } as any;

  // Log successful authentication
  logger.info('User authenticated', {
    userId: user.id,
    email: user.email,
    roles,
    ip: req.ip,
    userAgent: req.get('User-Agent'),
  });

  next();
});

/**
 * Optional authentication - doesn't throw error if no token
 * مصادقة اختيارية - لا تثير خطأ في حالة عدم وجود رمز
 */
export const optionalAuth = asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
  const token = extractTokenFromHeader(req.headers.authorization);
  
  if (!token) {
    return next();
  }

  try {
    const payload = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: {
        userRoles: {
          include: {
            role: {
              include: {
                rolePermissions: {
                  include: {
                    permission: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    if (user && user.isActive) {
      const { password, twoFactorSecret, ...userWithoutSensitiveData } = user;
      req.user = {
        ...userWithoutSensitiveData,
        roles: user.userRoles.map(ur => ur.role),
      } as any;
    }
  } catch (error) {
    // Ignore authentication errors for optional auth
    logger.debug('Optional authentication failed', {
      error: error instanceof Error ? error.message : 'Unknown error'
    });
  }

  next();
});

/**
 * Require specific role
 * طلب دور محدد
 */
export const requireRole = (roleName: string) => {
  return asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
    }

    const hasRole = req.user.roles.some((role: any) => role.name === roleName);
    
    if (!hasRole) {
      throw new AppError(`Role '${roleName}' required`, 403, 'INSUFFICIENT_ROLE');
    }

    next();
  });
};

/**
 * Require any of the specified roles
 * طلب أي من الأدوار المحددة
 */
export const requireAnyRole = (roleNames: string[]) => {
  return asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
    }

    const hasAnyRole = req.user.roles.some((role: any) => 
      roleNames.includes(role.name)
    );
    
    if (!hasAnyRole) {
      throw new AppError(`One of these roles required: ${roleNames.join(', ')}`, 403, 'INSUFFICIENT_ROLE');
    }

    next();
  });
};

/**
 * Require specific permission
 * طلب صلاحية محددة
 */
export const requirePermission = (permissionName: string) => {
  return asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
    }

    // Get user permissions
    const userPermissions = req.user.roles.flatMap((role: any) => 
      role.rolePermissions?.map((rp: any) => rp.permission.name) || []
    );

    const hasPermission = userPermissions.includes(permissionName);
    
    if (!hasPermission) {
      throw new AppError(`Permission '${permissionName}' required`, 403, 'INSUFFICIENT_PERMISSION');
    }

    next();
  });
};

/**
 * Require any of the specified permissions
 * طلب أي من الصلاحيات المحددة
 */
export const requireAnyPermission = (permissionNames: string[]) => {
  return asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
    }

    // Get user permissions
    const userPermissions = req.user.roles.flatMap((role: any) => 
      role.rolePermissions?.map((rp: any) => rp.permission.name) || []
    );

    const hasAnyPermission = permissionNames.some(permission => 
      userPermissions.includes(permission)
    );
    
    if (!hasAnyPermission) {
      throw new AppError(`One of these permissions required: ${permissionNames.join(', ')}`, 403, 'INSUFFICIENT_PERMISSION');
    }

    next();
  });
};

/**
 * Check if user owns resource or has admin privileges
 * التحقق من ملكية المستخدم للمورد أو امتلاك صلاحيات إدارية
 */
export const requireOwnershipOrAdmin = (userIdField: string = 'userId') => {
  return asyncHandler(async (req: Request, _res: Response, next: NextFunction) => {
    if (!req.user) {
      throw new AppError('Authentication required', 401, 'AUTHENTICATION_REQUIRED');
    }

    // Check if user is admin
    const isAdmin = req.user.roles.some((role: any) => 
      ['Super Admin', 'Admin'].includes(role.name)
    );

    if (isAdmin) {
      return next();
    }

    // Check ownership
    const resourceUserId = req.params[userIdField] || req.body[userIdField];
    
    if (req.user.id !== resourceUserId) {
      throw new AppError('Access denied: insufficient privileges', 403, 'ACCESS_DENIED');
    }

    next();
  });
};
