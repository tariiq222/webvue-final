/**
 * 🔐 Authentication Service
 * خدمة المصادقة
 * 
 * Core authentication business logic including login, registration,
 * token management, and 2FA operations.
 */

import { prisma } from '@/database/connection';
import { hashPassword, verifyPassword } from '@/shared/utils/password';
import { generateTokenPair, verifyRefreshToken } from '@/shared/utils/jwt';
import { generate2FASetupData, verify2FAToken } from '@/shared/utils/twoFactor';
import { AppError } from '@/shared/middleware/errorHandler';
import { logger } from '@/shared/utils/logger';
import { LoginCredentials, RegisterData, AuthTokens, User } from '@/shared/types';

export class AuthService {
  /**
   * User login
   * تسجيل دخول المستخدم
   */
  async login(credentials: LoginCredentials, ipAddress: string, userAgent: string): Promise<{
    user: Omit<User, 'password'>;
    tokens: AuthTokens;
    requiresTwoFactor?: boolean;
  }> {
    const { email, password, twoFactorCode } = credentials;

    // Find user with roles and permissions
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
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
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    if (!user.isActive) {
      throw new AppError('Account is deactivated', 401, 'ACCOUNT_DEACTIVATED');
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Invalid credentials', 401, 'INVALID_CREDENTIALS');
    }

    // Check 2FA if enabled
    if (user.twoFactorEnabled) {
      if (!twoFactorCode) {
        return {
          user: this.sanitizeUser(user),
          tokens: {} as AuthTokens,
          requiresTwoFactor: true,
        };
      }

      if (!user.twoFactorSecret) {
        throw new AppError('2FA configuration error', 500, 'TWO_FA_CONFIG_ERROR');
      }

      const is2FAValid = verify2FAToken(twoFactorCode, user.twoFactorSecret);
      if (!is2FAValid) {
        throw new AppError('Invalid 2FA code', 401, 'INVALID_TWO_FA_CODE');
      }
    }

    // Generate tokens
    const roles = user.userRoles.map(ur => ur.role.name);
    const permissions = user.userRoles.flatMap(ur =>
      ur.role.rolePermissions.map(rp => rp.permission.name)
    );

    const tokens = generateTokenPair({
      userId: user.id,
      email: user.email,
      username: user.username,
      roles,
      permissions,
    });

    // Store refresh token
    await prisma.refreshToken.create({
      data: {
        userId: user.id,
        token: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    // Update last login
    await prisma.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        lastLoginIp: ipAddress,
      },
    });

    // Log successful login
    logger.info('User logged in successfully', {
      userId: user.id,
      email: user.email,
      ipAddress,
      userAgent,
    });

    return {
      user: this.sanitizeUser(user),
      tokens,
    };
  }

  /**
   * User registration
   * تسجيل مستخدم جديد
   */
  async register(userData: RegisterData): Promise<Omit<User, 'password'>> {
    const { email, username, password, firstName, lastName } = userData;

    // Check if user already exists
    const existingUser = await prisma.user.findFirst({
      where: {
        OR: [
          { email: email.toLowerCase() },
          { username: username.toLowerCase() },
        ],
      },
    });

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        throw new AppError('Email already registered', 409, 'EMAIL_ALREADY_EXISTS');
      }
      if (existingUser.username === username.toLowerCase()) {
        throw new AppError('Username already taken', 409, 'USERNAME_ALREADY_EXISTS');
      }
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Get default user role
    const userRole = await prisma.role.findUnique({
      where: { name: 'User' },
    });

    if (!userRole) {
      throw new AppError('Default user role not found', 500, 'DEFAULT_ROLE_NOT_FOUND');
    }

    // Create user
    const user = await prisma.user.create({
      data: {
        email: email.toLowerCase(),
        username: username.toLowerCase(),
        password: hashedPassword,
        firstName,
        lastName,
        userRoles: {
          create: {
            roleId: userRole.id,
          },
        },
      },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    logger.info('User registered successfully', {
      userId: user.id,
      email: user.email,
      username: user.username,
    });

    return this.sanitizeUser(user);
  }

  /**
   * Refresh access token
   * تجديد رمز الوصول
   */
  async refreshToken(refreshToken: string): Promise<AuthTokens> {
    // Verify refresh token
    const payload = verifyRefreshToken(refreshToken);

    // Check if refresh token exists in database
    const storedToken = await prisma.refreshToken.findUnique({
      where: { token: refreshToken },
      include: {
        user: {
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
        },
      },
    });

    if (!storedToken) {
      throw new AppError('Invalid refresh token', 401, 'INVALID_REFRESH_TOKEN');
    }

    if (storedToken.expiresAt < new Date()) {
      // Clean up expired token
      await prisma.refreshToken.delete({
        where: { id: storedToken.id },
      });
      throw new AppError('Refresh token expired', 401, 'REFRESH_TOKEN_EXPIRED');
    }

    if (!storedToken.user.isActive) {
      throw new AppError('Account is deactivated', 401, 'ACCOUNT_DEACTIVATED');
    }

    // Generate new tokens
    const roles = storedToken.user.userRoles.map(ur => ur.role.name);
    const permissions = storedToken.user.userRoles.flatMap(ur =>
      ur.role.rolePermissions.map(rp => rp.permission.name)
    );

    const tokens = generateTokenPair({
      userId: storedToken.user.id,
      email: storedToken.user.email,
      username: storedToken.user.username,
      roles,
      permissions,
    });

    // Update refresh token in database
    await prisma.refreshToken.update({
      where: { id: storedToken.id },
      data: {
        token: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
      },
    });

    return tokens;
  }

  /**
   * User logout
   * تسجيل خروج المستخدم
   */
  async logout(refreshToken: string): Promise<void> {
    // Remove refresh token from database
    await prisma.refreshToken.deleteMany({
      where: { token: refreshToken },
    });

    logger.info('User logged out successfully');
  }

  /**
   * Setup 2FA for user
   * إعداد المصادقة الثنائية للمستخدم
   */
  async setup2FA(userId: string): Promise<{
    secret: string;
    qrCode: string;
    backupCodes: string[];
    manualEntryKey: string;
  }> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    if (user.twoFactorEnabled) {
      throw new AppError('2FA is already enabled', 400, 'TWO_FA_ALREADY_ENABLED');
    }

    return generate2FASetupData(user.email);
  }

  /**
   * Enable 2FA for user
   * تفعيل المصادقة الثنائية للمستخدم
   */
  async enable2FA(userId: string, secret: string, token: string): Promise<void> {
    // Verify the token
    const isValid = verify2FAToken(token, secret);
    if (!isValid) {
      throw new AppError('Invalid 2FA token', 400, 'INVALID_TWO_FA_TOKEN');
    }

    // Enable 2FA for user
    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: true,
        twoFactorSecret: secret,
      },
    });

    logger.info('2FA enabled for user', { userId });
  }

  /**
   * Disable 2FA for user
   * تعطيل المصادقة الثنائية للمستخدم
   */
  async disable2FA(userId: string, token: string): Promise<void> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    if (!user.twoFactorEnabled || !user.twoFactorSecret) {
      throw new AppError('2FA is not enabled', 400, 'TWO_FA_NOT_ENABLED');
    }

    // Verify the token
    const isValid = verify2FAToken(token, user.twoFactorSecret);
    if (!isValid) {
      throw new AppError('Invalid 2FA token', 400, 'INVALID_TWO_FA_TOKEN');
    }

    // Disable 2FA for user
    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorEnabled: false,
        twoFactorSecret: null,
      },
    });

    logger.info('2FA disabled for user', { userId });
  }

  /**
   * Remove sensitive data from user object
   * إزالة البيانات الحساسة من كائن المستخدم
   */
  private sanitizeUser(user: any): Omit<User, 'password'> {
    const { password, twoFactorSecret, ...sanitizedUser } = user;
    return sanitizedUser;
  }
}
