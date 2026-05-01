import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import bcryptjs from 'bcryptjs';
import { config } from '../config';

export class CryptoUtils {
  /**
   * Generate a cryptographically secure numeric OTP.
   */
  static generateOTP(length: number = config.OTP_LENGTH): string {
    let otp = '';
    for (let i = 0; i < length; i++) {
      // crypto.randomInt is cryptographically secure (CSPRNG)
      otp += crypto.randomInt(0, 10).toString();
    }
    return otp;
  }

  /**
   * Generate a cryptographically secure alphanumeric credential.
   * Uses crypto.randomBytes to avoid Math.random() bias.
   */
  static generateCredential(length: number = config.CREDENTIAL_LENGTH): string {
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const charsetLen = charset.length;
    let result = '';
    // Over-sample to remove modulo bias, then truncate
    const bytes = crypto.randomBytes(length * 2);
    for (let i = 0; i < bytes.length && result.length < length; i++) {
      // Accept bytes only if they fall within the unbiased range
      const max = Math.floor(256 / charsetLen) * charsetLen;
      if (bytes[i] < max) {
        result += charset[bytes[i] % charsetLen];
      }
    }
    // Fallback: if we somehow didn't fill (extremely rare), pad
    while (result.length < length) {
      result += charset[crypto.randomInt(0, charsetLen)];
    }
    return result;
  }

  /** SHA-256 hex digest */
  static hashSHA256(data: string): string {
    return crypto.createHash('sha256').update(data).digest('hex');
  }

  /** bcrypt hash */
  static async hashBcrypt(data: string): Promise<string> {
    return bcryptjs.hash(data, 10);
  }

  /** bcrypt compare */
  static async compareBcrypt(data: string, hash: string): Promise<boolean> {
    return bcryptjs.compare(data, hash);
  }

  /** Keccak-256 equivalent via SHA3-256 */
  static keccak256(data: string): string {
    return crypto.createHash('sha3-256').update(data).digest('hex');
  }

  /** Sign a JWT */
  static generateJWT(payload: object, secret: string = config.JWT_SECRET as string): string {
    return jwt.sign(payload, secret, { expiresIn: '24h' });
  }

  /** Verify a JWT; returns null if invalid */
  static verifyJWT(token: string, secret: string = config.JWT_SECRET as string): any {
    try {
      return jwt.verify(token, secret);
    } catch {
      return null;
    }
  }

  /** Generate a hex verification ID for VVPAT slips */
  static generateVerificationId(): string {
    return crypto.randomBytes(8).toString('hex').toUpperCase();
  }

  /** AES-256-GCM encryption */
  static encryptAES256(
    data: string,
    key: string = crypto.randomBytes(32).toString('hex'),
  ): { encrypted: string; iv: string; tag: string; key: string } {
    const iv = crypto.randomBytes(16);
    const keyBuffer = Buffer.from(key, 'hex');
    const cipher = crypto.createCipheriv('aes-256-gcm', keyBuffer, iv);
    let encrypted = cipher.update(data, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const tag = (cipher as any).getAuthTag().toString('hex');
    return { encrypted, iv: iv.toString('hex'), tag, key };
  }

  /** AES-256-GCM decryption */
  static decryptAES256(encrypted: string, iv: string, key: string, tag: string): string {
    const decipher = crypto.createDecipheriv(
      'aes-256-gcm',
      Buffer.from(key, 'hex'),
      Buffer.from(iv, 'hex'),
    );
    (decipher as any).setAuthTag(Buffer.from(tag, 'hex'));
    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');
    return decrypted;
  }
}
