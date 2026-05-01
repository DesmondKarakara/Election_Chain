import nodemailer from 'nodemailer';
import { config } from '../config';

export class EmailService {
  private transporter = nodemailer.createTransport({
    host: config.SMTP_HOST,
    port: config.SMTP_PORT,
    secure: false,
    auth: {
      user: config.SMTP_USER,
      pass: config.SMTP_PASS,
    },
  });

  async sendOTP(email: string, otp: string, userName: string): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>ElectChain - Email Verification</h2>
        <p>Hello ${userName},</p>
        <p>Your one-time password (OTP) is:</p>
        <h3 style="color: #007bff; font-size: 24px; letter-spacing: 3px;">${otp}</h3>
        <p>This code will expire in 10 minutes.</p>
        <p style="color: #888; font-size: 12px;">
          If you did not request this code, please ignore this email.
        </p>
      </div>
    `;

    await this.transporter.sendMail({
      from: config.SMTP_FROM,
      to: email,
      subject: 'ElectChain - Email Verification Code',
      html,
    });
  }

  async sendCredentials(
    email: string,
    username: string,
    password: string,
    userName: string,
    slotTime: Date
  ): Promise<void> {
    const slotTimeStr = slotTime.toLocaleString();
    const loginUrl = `${config.FRONTEND_URL}/login`;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>ElectChain - Your Voting Credentials</h2>
        <p>Hello ${userName},</p>
        <p>Your voting slot has been confirmed. Use these one-time credentials to vote:</p>
        <div style="background: #f0f0f0; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <p><strong>Username:</strong> <code>${username}</code></p>
          <p><strong>Password:</strong> <code>${password}</code></p>
          <p><strong>Your voting slot:</strong> ${slotTimeStr}</p>
        </div>
        <p><strong style="color: #d9534f;">Important:</strong> These credentials are valid only during your assigned voting slot.</p>
        <p>
          <a href="${loginUrl}" style="display: inline-block; padding: 10px 20px; background: #007bff; color: white; text-decoration: none; border-radius: 5px;">
            Go to Voting Portal
          </a>
        </p>
        <p style="color: #888; font-size: 12px;">
          Please do not share these credentials with anyone.
        </p>
      </div>
    `;

    await this.transporter.sendMail({
      from: config.SMTP_FROM,
      to: email,
      subject: 'ElectChain - Your Voting Credentials',
      html,
    });
  }

  async sendVoteConfirmation(
    email: string,
    userName: string,
    verificationId: string
  ): Promise<void> {
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2>ElectChain - Vote Confirmation</h2>
        <p>Hello ${userName},</p>
        <p>Your vote has been successfully recorded.</p>
        <div style="background: #d4edda; padding: 20px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #28a745;">
          <p><strong>Verification ID:</strong> <code>${verificationId}</code></p>
          <p>Keep this ID for your records. This is your voter-verifiable confirmation.</p>
        </div>
        <p style="color: #888; font-size: 12px;">
          Thank you for participating in the election. This ID can be used to verify your vote was recorded,
          without revealing your voting choice.
        </p>
      </div>
    `;

    await this.transporter.sendMail({
      from: config.SMTP_FROM,
      to: email,
      subject: 'ElectChain - Vote Confirmation',
      html,
    });
  }
}

export const emailService = new EmailService();
