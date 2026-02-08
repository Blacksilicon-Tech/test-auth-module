import * as nodemailer from 'nodemailer';
import { Injectable, InternalServerErrorException } from '@nestjs/common';

@Injectable()
export class MailService {
  private transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT),
      secure: false, // true only for port 465
      auth: {
        user: process.env.MAIL_USER,
        pass: process.env.MAIL_PASS,
      },
    });
  }

  async sendOtpEmail(
    to: string,
    subject: string,
    otp: string,
  ): Promise<void> {
    try {
      await this.transporter.sendMail({
        from: process.env.MAIL_FROM,
        to,
        subject,
        html: `
          <div style="font-family: Arial, sans-serif;">
            <h2>${subject}</h2>
            <p>Your OTP code is:</p>
            <h1 style="letter-spacing: 4px;">${otp}</h1>
            <p>This code expires in 10 minutes.</p>
            <p>If you did not request this, please ignore.</p>
          </div>
        `,
      });

      console.log('OTP email sent to:', to);
    } catch (error) {
      console.error('Failed to send OTP email:', error);
      throw new InternalServerErrorException(
        'Failed to send OTP email',
      );
    }
  }
}
