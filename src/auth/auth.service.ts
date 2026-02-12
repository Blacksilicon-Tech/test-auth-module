import { Injectable, UnauthorizedException, ConflictException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { EmailService } from '../email/email.service';
import { SignupDto, SigninDto, VerifyEmailDto, ResetPasswordDto } from './dto/auth.dto';
import { User } from '../user/user.entity';

@Injectable()
export class AuthService {
  constructor(
    private userService: UserService,
    private jwtService: JwtService,
    private configService: ConfigService,
    private emailService: EmailService,
  ) {}

  async signup(signupDto: SignupDto) {
    const existingUser = await this.userService.findByEmail(signupDto.email);
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    const hashedPassword = await bcrypt.hash(signupDto.password, 10);
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date();
    otpExpires.setMinutes(otpExpires.getMinutes() + Number(this.configService.get<number>('OTP_EXPIRATION_MINUTES', 10)));

    const user = await this.userService.create({
      email: signupDto.email,
      password: hashedPassword,
      name: signupDto.name,
      verificationOtp: otp,
      verificationOtpExpires: otpExpires,
    });

    await this.emailService.sendOtpEmail(user.email, otp, 'verification');
    return {
      message: 'Signup successful. Please verify your email with the OTP sent.',
      email: user.email,
    };
  }

  async verifyEmail(verifyEmailDto: VerifyEmailDto) {
    const user = await this.userService.findByEmail(verifyEmailDto.email);
    if (!user) {
      throw new BadRequestException('Invalid email or OTP');
    }

    if (user.isVerified) {
      throw new BadRequestException('Email already verified');
    }

    if (user.verificationOtp !== verifyEmailDto.otp || !user.verificationOtpExpires || user.verificationOtpExpires < new Date()) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    user.isVerified = true;
    user.verificationOtp = null;
    user.verificationOtpExpires = null;
    await this.userService.save(user);

    return { message: 'Email verified successfully' };
  }

  async signin(signinDto: SigninDto) {
    const user = await this.userService.findByEmail(signinDto.email);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Check if account is locked
    if (user.lockUntil && user.lockUntil > new Date()) {
      const remainingMinutes = Math.ceil((user.lockUntil.getTime() - Date.now()) / 60000);
      throw new ForbiddenException(`Account is locked. Try again in ${remainingMinutes} minutes.`);
    }

    if (!user.isVerified) {
      throw new UnauthorizedException('Please verify your email first');
    }

    const isPasswordValid = await bcrypt.compare(signinDto.password, user.password);

    if (!isPasswordValid) {
      await this.handleFailedLogin(user);
      throw new UnauthorizedException('Invalid credentials');
    }

    // Reset failed attempts on successful login
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    await this.userService.save(user);

    const payload = { email: user.email, sub: user.id };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
      },
    };
  }

  private async handleFailedLogin(user: User) {
    user.failedLoginAttempts += 1;
    const maxAttempts = this.configService.get<number>('MAX_FAILED_ATTEMPTS', 3);

    if (user.failedLoginAttempts >= maxAttempts) {
      const lockDuration = Number(this.configService.get<number>('LOCKOUT_DURATION_MINUTES', 15));
      const lockUntil = new Date();
      lockUntil.setMinutes(lockUntil.getMinutes() + lockDuration);
      user.lockUntil = lockUntil;
      user.failedLoginAttempts = 0; 
    }

    await this.userService.save(user);
  }

  async forgotPassword(email: string) {
    const user = await this.userService.findByEmail(email);
    if (!user) {
      throw new BadRequestException('User not found');
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const otpExpires = new Date();
    otpExpires.setMinutes(otpExpires.getMinutes() + Number(this.configService.get<number>('OTP_EXPIRATION_MINUTES', 10)));

    user.passwordResetOtp = otp;
        user.passwordResetOtpExpires = otpExpires;
    await this.userService.save(user);




        await this.emailService.sendOtpEmail(email, otp, 'reset');
    return {
      message: 'Password reset OTP sent to your email.',
    };
  }

  async resetPassword(resetPasswordDto: ResetPasswordDto) {
    const user = await this.userService.findByEmail(resetPasswordDto.email);
    if (!user || user.passwordResetOtp !== resetPasswordDto.otp || !user.passwordResetOtpExpires || user.passwordResetOtpExpires < new Date()) {
      throw new BadRequestException('Invalid or expired OTP');
    }

    user.password = await bcrypt.hash(resetPasswordDto.newPassword, 10);
    user.passwordResetOtp = null;
    user.passwordResetOtpExpires = null;
    user.lockUntil = null;
    user.failedLoginAttempts = 0;
    await this.userService.save(user);

    return { message: 'Password reset successful' };
  }
}
