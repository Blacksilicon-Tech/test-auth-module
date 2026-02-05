// Sends OTP emails. In development, can log instead of sending (MAIL_LOG_ONLY=true).
import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import nodemailer from "nodemailer";

@Injectable()
export class MailService {
  private readonly logger = new Logger(MailService.name);

  constructor(private readonly config: ConfigService) {}

  async sendOtpEmail(to: string, subject: string, otp: string) {
    const mailCfg = this.config.get("mail") as any;

    // Log-only mode (good for local dev or assessments)
    if (mailCfg.logOnly) {
      this.logger.warn(
        `[MAIL_LOG_ONLY] To=${to} Subject="${subject}" OTP=${otp}`
      );
      return;
    }

    const transporter = nodemailer.createTransport({
      host: mailCfg.host,
      port: mailCfg.port,
      secure: mailCfg.port === 465,
      auth: mailCfg.user ? { user: mailCfg.user, pass: mailCfg.pass } : undefined
    });

    await transporter.sendMail({
      from: mailCfg.from,
      to,
      subject,
      text: `Your OTP is: ${otp}\n\nIt expires soon. If you did not request this, ignore this email.`
    });
  }
}
