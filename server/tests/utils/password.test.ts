/**
 * 🧪 Password Utilities Tests
 * اختبارات أدوات كلمات المرور
 * 
 * Test suite for password utility functions.
 */

import {
  hashPassword,
  verifyPassword,
  validatePasswordStrength,
  generateRandomPassword,
  shouldChangePassword,
  generatePasswordResetToken,
} from '../../src/shared/utils/password';

describe('Password Utilities', () => {
  describe('hashPassword', () => {
    it('should hash password correctly', async () => {
      const password = 'TestPassword123';
      const hashedPassword = await hashPassword(password);

      expect(hashedPassword).toBeDefined();
      expect(hashedPassword).not.toBe(password);
      expect(hashedPassword.length).toBeGreaterThan(50);
    });

    it('should generate different hashes for same password', async () => {
      const password = 'TestPassword123';
      const hash1 = await hashPassword(password);
      const hash2 = await hashPassword(password);

      expect(hash1).not.toBe(hash2);
    });
  });

  describe('verifyPassword', () => {
    it('should verify correct password', async () => {
      const password = 'TestPassword123';
      const hashedPassword = await hashPassword(password);
      const isValid = await verifyPassword(password, hashedPassword);

      expect(isValid).toBe(true);
    });

    it('should reject incorrect password', async () => {
      const password = 'TestPassword123';
      const wrongPassword = 'WrongPassword123';
      const hashedPassword = await hashPassword(password);
      const isValid = await verifyPassword(wrongPassword, hashedPassword);

      expect(isValid).toBe(false);
    });
  });

  describe('validatePasswordStrength', () => {
    it('should validate strong password', () => {
      const password = 'StrongPass123!';
      const result = validatePasswordStrength(password);

      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
      expect(result.score).toBeGreaterThan(80);
    });

    it('should reject password too short', () => {
      const password = 'Short1!';
      const result = validatePasswordStrength(password);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must be at least 8 characters long');
    });

    it('should reject password without uppercase', () => {
      const password = 'lowercase123!';
      const result = validatePasswordStrength(password);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one uppercase letter');
    });

    it('should reject password without lowercase', () => {
      const password = 'UPPERCASE123!';
      const result = validatePasswordStrength(password);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one lowercase letter');
    });

    it('should reject password without numbers', () => {
      const password = 'NoNumbers!';
      const result = validatePasswordStrength(password);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one number');
    });

    it('should reject password without special characters', () => {
      const password = 'NoSpecialChars123';
      const result = validatePasswordStrength(password);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password must contain at least one special character');
    });

    it('should reject common patterns', () => {
      const password = 'password123';
      const result = validatePasswordStrength(password);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password contains common patterns and is not secure');
    });

    it('should reject repeated characters', () => {
      const password = 'Passsssword123!';
      const result = validatePasswordStrength(password);

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Password should not contain repeated characters');
    });
  });

  describe('generateRandomPassword', () => {
    it('should generate password with default length', () => {
      const password = generateRandomPassword();

      expect(password).toBeDefined();
      expect(password.length).toBe(12);
    });

    it('should generate password with custom length', () => {
      const length = 16;
      const password = generateRandomPassword(length);

      expect(password.length).toBe(length);
    });

    it('should generate password with required character types', () => {
      const password = generateRandomPassword(20);

      expect(/[A-Z]/.test(password)).toBe(true); // Uppercase
      expect(/[a-z]/.test(password)).toBe(true); // Lowercase
      expect(/\d/.test(password)).toBe(true); // Numbers
      expect(/[!@#$%^&*()_+\-=\[\]{};':\"\\|,.<>\/?]/.test(password)).toBe(true); // Symbols
    });

    it('should generate different passwords each time', () => {
      const password1 = generateRandomPassword();
      const password2 = generateRandomPassword();

      expect(password1).not.toBe(password2);
    });
  });

  describe('shouldChangePassword', () => {
    it('should return true for null password change date', () => {
      const result = shouldChangePassword(null);
      expect(result).toBe(true);
    });

    it('should return true for old password', () => {
      const oldDate = new Date();
      oldDate.setDate(oldDate.getDate() - 100); // 100 days ago
      
      const result = shouldChangePassword(oldDate, 90);
      expect(result).toBe(true);
    });

    it('should return false for recent password change', () => {
      const recentDate = new Date();
      recentDate.setDate(recentDate.getDate() - 30); // 30 days ago
      
      const result = shouldChangePassword(recentDate, 90);
      expect(result).toBe(false);
    });
  });

  describe('generatePasswordResetToken', () => {
    it('should generate token with correct length', () => {
      const token = generatePasswordResetToken();

      expect(token).toBeDefined();
      expect(token.length).toBe(32);
    });

    it('should generate different tokens each time', () => {
      const token1 = generatePasswordResetToken();
      const token2 = generatePasswordResetToken();

      expect(token1).not.toBe(token2);
    });

    it('should generate alphanumeric token', () => {
      const token = generatePasswordResetToken();

      expect(/^[A-Za-z0-9]+$/.test(token)).toBe(true);
    });
  });
});
