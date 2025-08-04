/**
 * 👤 Profile Service
 * خدمة الملف الشخصي
 * 
 * Business logic for user profile management operations.
 */

import { prisma } from '@/database/connection';
import { hashPassword, verifyPassword, validatePasswordStrength } from '@/shared/utils/password';
import { AppError } from '@/shared/middleware/errorHandler';
import { logger } from '@/shared/utils/logger';
import { User } from '@/shared/types';

export class ProfileService {
  /**
   * Get user profile
   * الحصول على الملف الشخصي للمستخدم
   */
  async getProfile(userId: string): Promise<User> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
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
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    return this.sanitizeUser(user);
  }

  /**
   * Update user profile
   * تحديث الملف الشخصي للمستخدم
   */
  async updateProfile(userId: string, profileData: {
    firstName?: string;
    lastName?: string;
    email?: string;
    username?: string;
    avatar?: string;
  }): Promise<User> {
    const { firstName, lastName, email, username, avatar } = profileData;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!existingUser) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Check for email/username conflicts
    if (email || username) {
      const conflictUser = await prisma.user.findFirst({
        where: {
          AND: [
            { id: { not: userId } },
            {
              OR: [
                email ? { email: email.toLowerCase() } : {},
                username ? { username: username.toLowerCase() } : {},
              ].filter(condition => Object.keys(condition).length > 0),
            },
          ],
        },
      });

      if (conflictUser) {
        if (email && conflictUser.email === email.toLowerCase()) {
          throw new AppError('Email already exists', 409, 'EMAIL_ALREADY_EXISTS');
        }
        if (username && conflictUser.username === username.toLowerCase()) {
          throw new AppError('Username already exists', 409, 'USERNAME_ALREADY_EXISTS');
        }
      }
    }

    // Update profile
    const updateData: any = {};
    if (firstName !== undefined) updateData.firstName = firstName;
    if (lastName !== undefined) updateData.lastName = lastName;
    if (email !== undefined) updateData.email = email.toLowerCase();
    if (username !== undefined) updateData.username = username.toLowerCase();
    if (avatar !== undefined) updateData.avatar = avatar;

    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
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

    logger.info('Profile updated successfully', {
      userId,
      updatedFields: Object.keys(updateData),
    });

    return this.sanitizeUser(user);
  }

  /**
   * Change user password
   * تغيير كلمة مرور المستخدم
   */
  async changePassword(userId: string, passwordData: {
    currentPassword: string;
    newPassword: string;
  }): Promise<void> {
    const { currentPassword, newPassword } = passwordData;

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Verify current password
    const isCurrentPasswordValid = await verifyPassword(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      throw new AppError('Current password is incorrect', 400, 'INVALID_CURRENT_PASSWORD');
    }

    // Validate new password strength
    const passwordValidation = validatePasswordStrength(newPassword);
    if (!passwordValidation.isValid) {
      throw new AppError('New password does not meet requirements', 400, 'WEAK_PASSWORD', passwordValidation.errors);
    }

    // Check if new password is different from current
    const isSamePassword = await verifyPassword(newPassword, user.password);
    if (isSamePassword) {
      throw new AppError('New password must be different from current password', 400, 'SAME_PASSWORD');
    }

    // Hash new password
    const hashedNewPassword = await hashPassword(newPassword);

    // Update password
    await prisma.user.update({
      where: { id: userId },
      data: {
        password: hashedNewPassword,
        passwordChangedAt: new Date(),
      },
    });

    // Invalidate all refresh tokens for security
    await prisma.refreshToken.deleteMany({
      where: { userId },
    });

    logger.info('Password changed successfully', {
      userId,
      email: user.email,
    });
  }

  /**
   * Upload profile avatar
   * رفع صورة الملف الشخصي
   */
  async uploadAvatar(userId: string, file: Express.Multer.File): Promise<{ avatarUrl: string }> {
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
    });

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Generate avatar URL (in production, this would be uploaded to cloud storage)
    const avatarUrl = `/uploads/avatars/${file.filename}`;

    // Update user avatar
    await prisma.user.update({
      where: { id: userId },
      data: { avatar: avatarUrl },
    });

    // Save file record
    await prisma.uploadedFile.create({
      data: {
        originalName: file.originalname,
        filename: file.filename,
        mimetype: file.mimetype,
        size: file.size,
        path: file.path,
        url: avatarUrl,
        uploadedBy: userId,
      },
    });

    logger.info('Avatar uploaded successfully', {
      userId,
      filename: file.filename,
      size: file.size,
    });

    return { avatarUrl };
  }

  /**
   * Delete user account
   * حذف حساب المستخدم
   */
  async deleteAccount(userId: string, password: string): Promise<void> {
    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        userRoles: {
          include: {
            role: true,
          },
        },
      },
    });

    if (!user) {
      throw new AppError('User not found', 404, 'USER_NOT_FOUND');
    }

    // Verify password
    const isPasswordValid = await verifyPassword(password, user.password);
    if (!isPasswordValid) {
      throw new AppError('Password is incorrect', 400, 'INVALID_PASSWORD');
    }

    // Check if user is admin
    const isAdmin = user.userRoles.some(ur => ur.role.name === 'Super Admin');
    if (isAdmin) {
      // Check if this is the last admin
      const adminRole = await prisma.role.findUnique({
        where: { name: 'Super Admin' },
        include: {
          userRoles: true,
        },
      });

      if (adminRole && adminRole.userRoles.length <= 1) {
        throw new AppError('Cannot delete the last admin account', 400, 'CANNOT_DELETE_LAST_ADMIN');
      }
    }

    // Delete user account (cascade will handle related records)
    await prisma.user.delete({
      where: { id: userId },
    });

    logger.info('User account deleted successfully', {
      userId,
      email: user.email,
    });
  }

  /**
   * Get user activity log
   * الحصول على سجل نشاط المستخدم
   */
  async getActivityLog(userId: string, params: {
    page?: number;
    limit?: number;
  }): Promise<{
    activities: any[];
    pagination: any;
  }> {
    const { page = 1, limit = 20 } = params;

    // Get user activities from audit log
    const total = await prisma.auditLog.count({
      where: { userId },
    });

    const activities = await prisma.auditLog.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
      select: {
        id: true,
        action: true,
        resource: true,
        resourceId: true,
        details: true,
        ipAddress: true,
        userAgent: true,
        createdAt: true,
      },
    });

    const totalPages = Math.ceil(total / limit);

    return {
      activities,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  /**
   * Get user sessions
   * الحصول على جلسات المستخدم
   */
  async getSessions(userId: string): Promise<any[]> {
    const sessions = await prisma.session.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        ipAddress: true,
        userAgent: true,
        createdAt: true,
        expiresAt: true,
      },
    });

    return sessions.map(session => ({
      ...session,
      isActive: session.expiresAt > new Date(),
    }));
  }

  /**
   * Revoke user session
   * إلغاء جلسة المستخدم
   */
  async revokeSession(userId: string, sessionId: string): Promise<void> {
    const session = await prisma.session.findFirst({
      where: {
        id: sessionId,
        userId,
      },
    });

    if (!session) {
      throw new AppError('Session not found', 404, 'SESSION_NOT_FOUND');
    }

    await prisma.session.delete({
      where: { id: sessionId },
    });

    logger.info('Session revoked successfully', {
      userId,
      sessionId,
    });
  }

  /**
   * Revoke all user sessions
   * إلغاء جميع جلسات المستخدم
   */
  async revokeAllSessions(userId: string): Promise<void> {
    await prisma.session.deleteMany({
      where: { userId },
    });

    await prisma.refreshToken.deleteMany({
      where: { userId },
    });

    logger.info('All sessions revoked successfully', {
      userId,
    });
  }

  /**
   * Remove sensitive data from user object
   * إزالة البيانات الحساسة من كائن المستخدم
   */
  private sanitizeUser(user: any): User {
    const { password, twoFactorSecret, ...sanitizedUser } = user;
    return sanitizedUser;
  }
}
