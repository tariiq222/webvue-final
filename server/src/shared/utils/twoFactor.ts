/**
 * 🔐 Two-Factor Authentication Utilities
 * أدوات المصادقة الثنائية
 * 
 * 2FA setup, verification, and QR code generation utilities.
 */

import speakeasy from 'speakeasy';
import QRCode from 'qrcode';
import { config } from '@/config/environment';

/**
 * Generate 2FA secret
 * إنشاء سر المصادقة الثنائية
 */
export function generate2FASecret(userEmail: string): {
  secret: string;
  otpauthUrl: string;
} {
  const secret = speakeasy.generateSecret({
    name: userEmail,
    issuer: config.twoFA.issuer,
    length: 32,
  });

  return {
    secret: secret.base32,
    otpauthUrl: secret.otpauth_url!,
  };
}

/**
 * Generate QR code for 2FA setup
 * إنشاء رمز QR لإعداد المصادقة الثنائية
 */
export async function generate2FAQRCode(otpauthUrl: string): Promise<string> {
  try {
    const qrCodeDataURL = await QRCode.toDataURL(otpauthUrl, {
      errorCorrectionLevel: 'M',
      type: 'image/png',
      quality: 0.92,
      margin: 1,
      color: {
        dark: '#000000',
        light: '#FFFFFF',
      },
      width: 256,
    });

    return qrCodeDataURL;
  } catch (error) {
    throw new Error('Failed to generate QR code');
  }
}

/**
 * Verify 2FA token
 * التحقق من رمز المصادقة الثنائية
 */
export function verify2FAToken(token: string, secret: string): boolean {
  return speakeasy.totp.verify({
    secret,
    encoding: 'base32',
    token,
    window: config.twoFA.window, // Allow some time drift
  });
}

/**
 * Generate backup codes
 * إنشاء رموز النسخ الاحتياطي
 */
export function generateBackupCodes(count: number = 10): string[] {
  const codes: string[] = [];
  
  for (let i = 0; i < count; i++) {
    // Generate 8-character alphanumeric code
    const code = Math.random().toString(36).substring(2, 10).toUpperCase();
    codes.push(code);
  }
  
  return codes;
}

/**
 * Format backup code for display
 * تنسيق رمز النسخ الاحتياطي للعرض
 */
export function formatBackupCode(code: string): string {
  // Add dashes for better readability: ABCD-EFGH
  return code.replace(/(.{4})(.{4})/, '$1-$2');
}

/**
 * Validate backup code format
 * التحقق من تنسيق رمز النسخ الاحتياطي
 */
export function isValidBackupCodeFormat(code: string): boolean {
  // Remove dashes and check if it's 8 alphanumeric characters
  const cleanCode = code.replace(/-/g, '');
  return /^[A-Z0-9]{8}$/i.test(cleanCode);
}

/**
 * Generate 2FA setup response
 * إنشاء استجابة إعداد المصادقة الثنائية
 */
export async function generate2FASetupData(userEmail: string): Promise<{
  secret: string;
  qrCode: string;
  backupCodes: string[];
  manualEntryKey: string;
}> {
  const { secret, otpauthUrl } = generate2FASecret(userEmail);
  const qrCode = await generate2FAQRCode(otpauthUrl);
  const backupCodes = generateBackupCodes();

  return {
    secret,
    qrCode,
    backupCodes: backupCodes.map(formatBackupCode),
    manualEntryKey: secret,
  };
}

/**
 * Verify 2FA setup
 * التحقق من إعداد المصادقة الثنائية
 */
export function verify2FASetup(token: string, secret: string): {
  isValid: boolean;
  error?: string;
} {
  if (!token || token.length !== 6) {
    return {
      isValid: false,
      error: 'Invalid token format. Token must be 6 digits.',
    };
  }

  if (!/^\d{6}$/.test(token)) {
    return {
      isValid: false,
      error: 'Token must contain only numbers.',
    };
  }

  const isValid = verify2FAToken(token, secret);
  
  if (!isValid) {
    return {
      isValid: false,
      error: 'Invalid token. Please check your authenticator app and try again.',
    };
  }

  return { isValid: true };
}
