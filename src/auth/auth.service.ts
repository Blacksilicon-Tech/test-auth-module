// Core auth logic: signup, OTP verify, signin (lockout), password reset

import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { Repository, IsNull } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { UsersService } from '../users/users.service';
import { MailService } from '../mail/mail.service';

import { SignupDto } from './dto/signup.dto';
import { VerifyEmailDto } from './dto/verify-email.dto';
import { SigninDto } from './dto/signin.dto';
import { RequestPasswordResetDto } from './dto/request-password-reset.dto';
import { ConfirmPasswordResetDto } from './dto/confirm-password-reset.dto';

import { assertPasswordPolicy } from '../common/utils/password-policy';
import { Otp } from './entities/otp.entity';
import { OtpPurpose } from './auth.constants';
import { User } from '../users/entities/user.entity';

function generateOtp6(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

@Injectable()
export class AuthService {
  private readonly otpExpiresMinutes: number;
  private readonly lockoutThreshold: number;
  private readonly lockoutMinutes: number;

  constructor(
    private readonly usersService: UsersService,
    private readonly mailService: MailService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,

    @InjectRepository(Otp)
    private readonly otpRepo: Repository<Otp>,
  ) {
    const security = this.config.get('security') as any;

    this.otpExpiresMinutes = security.otpExpiresMinutes;
    this.lockoutThreshold = security.lockoutThreshold;
    this.lockoutMinutes = security.lockoutMinutes;
  }

  private async issueOtp(
    email: string,
    purpose: OtpPurpose,
    user?: User | null,
  ): Promise<string> {
    const otp = generateOtp6();
    const codeHash = await bcrypt.hash(otp, 10);

    await this.otpRepo.update(
      { email: email.toLowerCase(), purpose, consumedAt: IsNull() },
      { consumedAt: new Date() },
    );

    const expiresAt = new Date(
      Date.now() + this.otpExpiresMinutes * 60 * 1000,
    );

    await this.otpRepo.save(
      this.otpRepo.create({
        email: email.toLowerCase(),
        purpose,
        codeHash,
        expiresAt,
        consumedAt: null,
        user: user ?? null,
      }),
    );

    return otp;
  }

  private async verifyOtp(
    email: string,
    purpose: OtpPurpose,
    otp: string,
  ): Promise<void> {
    const record = await this.otpRepo.findOne({
      where: {
        email: email.toLowerCase(),
        purpose,
        consumedAt: IsNull(),
      },
      order: { createdAt: 'DESC' },
    });

    if (!record || record.expiresAt.getTime() < Date.now()) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    const isValid = await bcrypt.compare(otp, record.codeHash);
    if (!isValid) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    record.consumedAt = new Date();
    await this.otpRepo.save(record);
  }

  async signup(dto: SignupDto) {
    const email = dto.email.toLowerCase();

    assertPasswordPolicy(dto.password);

    if (await this.usersService.findByEmail(email)) {
      throw new BadRequestException('Email already in use');
    }

    const user = await this.usersService.createUser({
      email,
      passwordHash: await bcrypt.hash(dto.password, 12),
      fullName: dto.fullName ?? null,
      isEmailVerified: false,
    });

    const otp = await this.issueOtp(
      email,
      OtpPurpose.EMAIL_VERIFICATION,
      user,
    );

    await this.mailService.sendOtpEmail(
      email,
      'Verify your email',
      otp,
    );

    return {
      message: 'Signup successful. OTP sent to email.',
      email: user.email,
    };
  }

  async verifyEmail(dto: VerifyEmailDto) {
    const email = dto.email.toLowerCase();
    const user = await this.usersService.findByEmail(email);

    if (!user) throw new BadRequestException('Invalid request');

    await this.verifyOtp(
      email,
      OtpPurpose.EMAIL_VERIFICATION,
      dto.otp,
    );

    user.isEmailVerified = true;
    await this.usersService.save(user);

    return { message: 'Email verified successfully' };
  }

  async signin(dto: SigninDto) {
    const user = await this.usersService.findByEmail(
      dto.email.toLowerCase(),
    );

    if (!user) throw new UnauthorizedException('Invalid credentials');

    if (user.lockUntil && user.lockUntil > new Date()) {
      throw new ForbiddenException('Account locked');
    }

    const ok = await bcrypt.compare(
      dto.password,
      user.passwordHash,
    );

    if (!ok) {
      user.failedLoginAttempts++;
      if (user.failedLoginAttempts >= this.lockoutThreshold) {
        user.lockUntil = new Date(
          Date.now() + this.lockoutMinutes * 60000,
        );
        user.failedLoginAttempts = 0;
      }
      await this.usersService.save(user);
      throw new UnauthorizedException('Invalid credentials');
    }

    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    await this.usersService.save(user);

    return {
      accessToken: await this.jwtService.signAsync({
        sub: user.id,
        email: user.email,
      }),
      user: this.usersService.sanitize(user),
    };
  }

  async requestPasswordReset(dto: RequestPasswordResetDto) {
    const email = dto.email.toLowerCase();
    const user = await this.usersService.findByEmail(email);

    if (user) {
      const otp = await this.issueOtp(
        email,
        OtpPurpose.PASSWORD_RESET,
        user,
      );

      await this.mailService.sendOtpEmail(
        email,
        'Password reset OTP',
        otp,
      );
    }

    return {
      message: 'If the account exists, an OTP has been sent.',
    };
  }

  async confirmPasswordReset(dto: ConfirmPasswordResetDto) {
    const email = dto.email.toLowerCase();
    const user = await this.usersService.findByEmail(email);

    if (!user) throw new BadRequestException('Invalid request');

    assertPasswordPolicy(dto.newPassword);

    await this.verifyOtp(
      email,
      OtpPurpose.PASSWORD_RESET,
      dto.otp,
    );

    user.passwordHash = await bcrypt.hash(dto.newPassword, 12);
    user.failedLoginAttempts = 0;
    user.lockUntil = null;

    await this.usersService.save(user);

    return { message: 'Password reset successful' };
  }
}
