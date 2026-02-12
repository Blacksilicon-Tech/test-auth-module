import { Injectable, Logger } from '@nestjs/common';
import { Resend } from 'resend';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class EmailService {
  private resend: Resend | null = null;
  private logger = new Logger('EmailService');

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('RESEND_API_KEY');
    if (apiKey && apiKey !== 'your_resend_api_key_here') {
      this.resend = new Resend(apiKey);
      this.logger.log('Resend email service initialized');
    } else {
      this.logger.warn('RESEND_API_KEY not configured. Email sending disabled.');
    }
  }

  async sendOtpEmail(email: string, otp: string, type: 'verification' | 'reset') {
    if (!this.resend) {
      this.logger.warn(`Email not sent to ${email}. Resend API key not configured.`);
      return { success: false, message: 'Email service not configured' };
    }

    const subject = type === 'verification' ? 'Verify Your Email' : 'Reset Your Password';
    const message = type === 'verification' 
      ? `Your OTP for email verification: ${otp}`
      : `Your OTP for password reset: ${otp}`;

    try {
      this.logger.log(` Attempting to send ${type} OTP (${otp}) to ${email}...`);
      const result = await this.resend.emails.send({
        from: 'onboarding@resend.dev', 
        to: email,
        subject: subject,
        html: `<div style="font-family: Arial, sans-serif;">
          <h2>${subject}</h2>
          <p>Your OTP code is: <strong>${otp}</strong></p>
          <p>This OTP expires in 10 minutes.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>`,
      });
      
      if (result.error) {
        this.logger.error(`Resend API error for ${email}:`, result.error);
        return result;
      }
      
      this.logger.log(`Email sent successfully to ${email}. Message ID: ${result?.data?.id || 'unknown'}`);
      return result;
    } catch (error) {
      this.logger.error(`Exception sending email to ${email}:`, error.message);
      return { success: false, error: error.message };
    }
  }
}
