/**
 * 📁 File Upload Middleware
 * وسطية رفع الملفات
 * 
 * Secure file upload middleware with validation and virus scanning.
 */

import multer from 'multer';
import path from 'path';
import fs from 'fs';
import crypto from 'crypto';
import { Request, Response, NextFunction } from 'express';
import { config } from '@/config/environment';
import { AppError } from './errorHandler';
import { logger } from '@/shared/utils/logger';

/**
 * File upload configuration
 * إعدادات رفع الملفات
 */
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = config.upload.path;
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    
    cb(null, uploadPath);
  },
  
  filename: (req, file, cb) => {
    // Generate unique filename
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const ext = path.extname(file.originalname);
    const name = path.basename(file.originalname, ext);
    const sanitizedName = name.replace(/[^a-zA-Z0-9]/g, '_');
    
    cb(null, `${sanitizedName}-${uniqueSuffix}${ext}`);
  },
});

/**
 * File filter function
 * دالة تصفية الملفات
 */
const fileFilter = (req: Request, file: Express.Multer.File, cb: multer.FileFilterCallback) => {
  // Check file type
  if (!config.upload.allowedTypes.includes(file.mimetype)) {
    return cb(new AppError(
      `File type ${file.mimetype} is not allowed`,
      400,
      'INVALID_FILE_TYPE'
    ));
  }

  // Check file extension
  const ext = path.extname(file.originalname).toLowerCase();
  const allowedExtensions = ['.jpg', '.jpeg', '.png', '.gif', '.pdf', '.zip', '.doc', '.docx'];
  
  if (!allowedExtensions.includes(ext)) {
    return cb(new AppError(
      `File extension ${ext} is not allowed`,
      400,
      'INVALID_FILE_EXTENSION'
    ));
  }

  cb(null, true);
};

/**
 * Multer configuration
 * إعدادات Multer
 */
export const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: config.upload.maxSize,
    files: 5, // Maximum 5 files per request
    fields: 10, // Maximum 10 non-file fields
  },
});

/**
 * File validation middleware
 * وسطية التحقق من الملفات
 */
export const validateFile = (req: Request, res: Response, next: NextFunction): void => {
  if (!req.file && !req.files) {
    return next();
  }

  const files = req.files ? (Array.isArray(req.files) ? req.files : Object.values(req.files).flat()) : [req.file];

  for (const file of files) {
    if (!file) continue;

    // Validate file size
    if (file.size > config.upload.maxSize) {
      throw new AppError(
        `File ${file.originalname} is too large. Maximum size is ${config.upload.maxSize} bytes`,
        400,
        'FILE_TOO_LARGE'
      );
    }

    // Validate file name
    if (file.originalname.length > 255) {
      throw new AppError(
        'File name is too long. Maximum length is 255 characters',
        400,
        'FILENAME_TOO_LONG'
      );
    }

    // Check for malicious file names
    const maliciousPatterns = [
      /\.\./,
      /[<>:"|?*]/,
      /^(con|prn|aux|nul|com[1-9]|lpt[1-9])$/i,
    ];

    for (const pattern of maliciousPatterns) {
      if (pattern.test(file.originalname)) {
        throw new AppError(
          'Invalid file name detected',
          400,
          'MALICIOUS_FILENAME'
        );
      }
    }
  }

  next();
};

/**
 * Generate file checksum
 * إنشاء مجموع تحقق الملف
 */
export const generateFileChecksum = (filePath: string): Promise<string> => {
  return new Promise((resolve, reject) => {
    const hash = crypto.createHash('sha256');
    const stream = fs.createReadStream(filePath);

    stream.on('data', (data) => {
      hash.update(data);
    });

    stream.on('end', () => {
      resolve(hash.digest('hex'));
    });

    stream.on('error', (error) => {
      reject(error);
    });
  });
};

/**
 * Virus scan simulation (placeholder)
 * محاكاة فحص الفيروسات (نائب)
 */
export const scanForVirus = async (filePath: string): Promise<boolean> => {
  // This is a placeholder for virus scanning
  // In production, integrate with ClamAV or similar antivirus solution
  
  try {
    // Read file header to check for known malicious signatures
    const buffer = Buffer.alloc(1024);
    const fd = fs.openSync(filePath, 'r');
    fs.readSync(fd, buffer, 0, 1024, 0);
    fs.closeSync(fd);

    // Check for common malicious signatures
    const maliciousSignatures = [
      Buffer.from('4D5A', 'hex'), // PE executable
      Buffer.from('7F454C46', 'hex'), // ELF executable
    ];

    for (const signature of maliciousSignatures) {
      if (buffer.indexOf(signature) === 0) {
        logger.warn('Malicious file signature detected', { filePath });
        return false;
      }
    }

    return true;
  } catch (error) {
    logger.error('Error during virus scan', { error, filePath });
    return false;
  }
};

/**
 * File security scan middleware
 * وسطية فحص أمان الملفات
 */
export const securityScan = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (!req.file && !req.files) {
    return next();
  }

  const files = req.files ? (Array.isArray(req.files) ? req.files : Object.values(req.files).flat()) : [req.file];

  try {
    for (const file of files) {
      if (!file) continue;

      // Scan for viruses
      const isClean = await scanForVirus(file.path);
      if (!isClean) {
        // Delete the infected file
        fs.unlinkSync(file.path);
        throw new AppError(
          'Malicious file detected and removed',
          400,
          'MALICIOUS_FILE_DETECTED'
        );
      }

      // Generate checksum
      file.checksum = await generateFileChecksum(file.path);
      
      logger.info('File security scan completed', {
        filename: file.filename,
        originalname: file.originalname,
        size: file.size,
        checksum: file.checksum,
      });
    }

    next();
  } catch (error) {
    // Clean up uploaded files on error
    for (const file of files) {
      if (file && fs.existsSync(file.path)) {
        fs.unlinkSync(file.path);
      }
    }
    throw error;
  }
};

/**
 * Clean up temporary files
 * تنظيف الملفات المؤقتة
 */
export const cleanupFiles = (req: Request, res: Response, next: NextFunction): void => {
  const originalEnd = res.end;
  
  res.end = function(chunk?: any, encoding?: any) {
    // Clean up files if request failed
    if (res.statusCode >= 400) {
      const files = req.files ? (Array.isArray(req.files) ? req.files : Object.values(req.files).flat()) : [req.file];
      
      for (const file of files) {
        if (file && fs.existsSync(file.path)) {
          fs.unlinkSync(file.path);
          logger.debug('Cleaned up uploaded file', { filename: file.filename });
        }
      }
    }
    
    return originalEnd.call(this, chunk, encoding);
  };

  next();
};

/**
 * Plugin file upload configuration
 * إعدادات رفع ملفات البلوجينز
 */
export const pluginUpload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadPath = config.plugin.path;
      
      if (!fs.existsSync(uploadPath)) {
        fs.mkdirSync(uploadPath, { recursive: true });
      }
      
      cb(null, uploadPath);
    },
    filename: (req, file, cb) => {
      const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
      const ext = path.extname(file.originalname);
      const name = path.basename(file.originalname, ext);
      const sanitizedName = name.replace(/[^a-zA-Z0-9]/g, '_');
      
      cb(null, `${sanitizedName}-${uniqueSuffix}${ext}`);
    },
  }),
  fileFilter: (req, file, cb) => {
    if (!config.plugin.allowedTypes.includes(file.mimetype)) {
      return cb(new AppError(
        `Plugin file type ${file.mimetype} is not allowed`,
        400,
        'INVALID_PLUGIN_FILE_TYPE'
      ));
    }
    cb(null, true);
  },
  limits: {
    fileSize: config.plugin.maxSize,
    files: 1, // Only one plugin file per request
  },
});
