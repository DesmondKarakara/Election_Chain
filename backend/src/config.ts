import dotenv from 'dotenv';

dotenv.config();

export const config = {
  // Server
  PORT: process.env.PORT || 3001,
  NODE_ENV: process.env.NODE_ENV || 'development',

  // Database
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://user:password@localhost:5432/civicchain',

  // JWT
  JWT_SECRET: process.env.JWT_SECRET || 'your-secret-key-change-in-production',
  JWT_EXPIRY: process.env.JWT_EXPIRY || '24h',

  // OTP
  OTP_LENGTH: 6,
  OTP_EXPIRY_MINUTES: 10,

  // Credentials
  CREDENTIAL_LENGTH: 16,
  CREDENTIAL_EXPIRY_HOURS: 2,

  // Stellar Blockchain
  STELLAR_NETWORK: process.env.STELLAR_NETWORK || 'TESTNET',
  STELLAR_RPC_URL: process.env.STELLAR_RPC_URL || 'https://soroban-testnet.stellar.org',
  STELLAR_SPONSOR_SECRET: process.env.STELLAR_SPONSOR_SECRET || '', // Will be auto-generated/funded if empty

  // Email
  SMTP_HOST: process.env.SMTP_HOST || 'smtp.mailtrap.io',
  SMTP_PORT: parseInt(process.env.SMTP_PORT || '2525'),
  SMTP_USER: process.env.SMTP_USER || '',
  SMTP_PASS: process.env.SMTP_PASS || '',
  SMTP_FROM: process.env.SMTP_FROM || 'electchain@example.com',

  // Frontend URL (for verification links)
  FRONTEND_URL: process.env.FRONTEND_URL || 'http://localhost:3000',
};
