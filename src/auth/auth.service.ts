// Core auth logic: signup, OTP verify, signin (lockout), password reset.
import {
  BadRequestException,
  ForbiddenException,
  Injectable,
  UnauthorizedException
} from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { InjectRepository } from "@nestjs/typeorm";
import { JwtService } from "@nestjs/jwt";
import { Repository, IsNull } from "typeorm";
import * as bcrypt from "bcrypt";
import { UsersService } from "../users/users.service.js";
import { MailService } from "../mail/mail.service";
import { SignupDto } from "./dto/signup.dto";
import { VerifyEmailDto } from "./dto/verify-email.dto";
import { SigninDto } from "./dto/signin.dto";
// import { RequestPasswordResetDto } from "./dto/request-password-reset.dto";
import { ConfirmPasswordResetDto } from "./dto/confirm-password-reset.dto";
import { assertPasswordPolicy } from "../common/utils/password-policy";
// ✅ correct
import { Otp } from "./entities/otp.entity.js";
import { OtpPurpose } from "./auth.constants";
// ✅ correct
import { User } from "../users/entities/user.entity.js";
import { RequestPasswordResetDto } from "./dto/request-password-reset.dto.js";

/** Generate a 6-digit OTP code */
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
    @InjectRepository(Otp) private readonly otpRepo: Repository<Otp>
  ) {
    const sec = this.config.get("security") as any;
    this.otpExpiresMinutes = sec.otpExpiresMinutes;
    this.lockoutThreshold = sec.lockoutThreshold;
    this.lockoutMinutes = sec.lockoutMinutes;
  }

  /** Issue an OTP and save to DB */
  private async issueOtp(email: string, purpose: OtpPurpose, user?: User | null) {
    const otp = generateOtp6();
    const codeHash = await bcrypt.hash(otp, 10);

    // Invalidate previous unconsumed OTPs
    await this.otpRepo.update(
      { email: email.toLowerCase(), purpose, consumedAt: IsNull() },
      { consumedAt: new Date() }
    );

    const expiresAt = new Date(Date.now() + this.otpExpiresMinutes * 60_000);

    await this.otpRepo.save(
      this.otpRepo.create({
        email: email.toLowerCase(),
        purpose,
        codeHash,
        expiresAt,
        consumedAt: null,
        user: user ?? null
      })
    );

    return otp;
  }

  /** Verify OTP for email/password reset */
  private async verifyOtp(email: string, purpose: OtpPurpose, otp: string) {
    const record = await this.otpRepo.findOne({
      where: { email: email.toLowerCase(), purpose, consumedAt: IsNull() },
      order: { createdAt: "DESC" }
    });

    if (!record) throw new BadRequestException("Invalid or expired OTP");

    if (record.expiresAt.getTime() < Date.now()) {
      record.consumedAt = new Date();
      await this.otpRepo.save(record);
      throw new BadRequestException("Invalid or expired OTP");
    }

    const ok = await bcrypt.compare(otp, record.codeHash);
    if (!ok) throw new BadRequestException("Invalid or expired OTP");

    record.consumedAt = new Date();
    await this.otpRepo.save(record);

    return true;
  }

  /** Signup a new user and send verification OTP */
  async signup(dto: SignupDto) {
    const email = dto.email.toLowerCase();

    // Enforce password policy
    try {
      assertPasswordPolicy(dto.password);
    } catch (e: any) {
      throw new BadRequestException(e.message);
    }

    // Check if email already exists
    const existing = await this.usersService.findByEmail(email);
    if (existing) throw new BadRequestException("Email already in use");

    const passwordHash = await bcrypt.hash(dto.password, 12);

    const user = await this.usersService.createUser({
      email,
      passwordHash,
      fullName: dto.fullName ?? null,
      isEmailVerified: false
    });

    // Issue OTP for email verification
    const otp = await this.issueOtp(email, OtpPurpose.EMAIL_VERIFICATION, user);
    await this.mailService.sendOtpEmail(email, "Verify your email", otp);

    return {
      message: "Signup successful. Please verify your email with the OTP sent.",
      email: user.email
    };
  }

  /** Verify user's email using OTP */
  async verifyEmail(dto: VerifyEmailDto) {
    const email = dto.email.toLowerCase();
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new BadRequestException("Invalid request");

    await this.verifyOtp(email, OtpPurpose.EMAIL_VERIFICATION, dto.otp);

    user.isEmailVerified = true;
    await this.usersService.save(user);

    return { message: "Email verified successfully." };
  }

  /** Signin user with lockout logic */
  async signin(dto: SigninDto) {
    const email = dto.email.toLowerCase();
    const user = await this.usersService.findByEmail(email);

    if (!user) throw new UnauthorizedException("Invalid credentials");

    // Account lockout
    if (user.lockUntil && user.lockUntil.getTime() > Date.now()) {
      throw new ForbiddenException("Account temporarily locked. Try again later.");
    }

    const ok = await bcrypt.compare(dto.password, user.passwordHash);
    if (!ok) {
      user.failedLoginAttempts += 1;

      if (user.failedLoginAttempts >= this.lockoutThreshold) {
        user.lockUntil = new Date(Date.now() + this.lockoutMinutes * 60_000);
        user.failedLoginAttempts = 0; // reset counter once locked
      }

      await this.usersService.save(user);
      throw new UnauthorizedException("Invalid credentials");
    }

    // Successful login: reset counters
    user.failedLoginAttempts = 0;
    user.lockUntil = null;
    await this.usersService.save(user);

    const token = await this.jwtService.signAsync({
      sub: user.id,
      email: user.email
    });

    return {
      accessToken: token,
      user: this.usersService.sanitize(user)
    };
  }

  /** Request a password reset OTP */
  async requestPasswordReset(dto: RequestPasswordResetDto) {
    const email = dto.email.toLowerCase();
    const user = await this.usersService.findByEmail(email);

    // Always return ok (prevent user enumeration)
    if (!user) return { message: "If the account exists, an OTP has been sent." };

    const otp = await this.issueOtp(email, OtpPurpose.PASSWORD_RESET, user);
    await this.mailService.sendOtpEmail(email, "Password reset OTP", otp);

    return { message: "If the account exists, an OTP has been sent." };
  }

  /** Confirm password reset using OTP */
  async confirmPasswordReset(dto: ConfirmPasswordResetDto) {
    const email = dto.email.toLowerCase();
    const user = await this.usersService.findByEmail(email);
    if (!user) throw new BadRequestException("Invalid request");

    // Enforce password policy
    try {
      assertPasswordPolicy(dto.newPassword);
    } catch (e: any) {
      throw new BadRequestException(e.message);
    }

    await this.verifyOtp(email, OtpPurpose.PASSWORD_RESET, dto.otp);

    user.passwordHash = await bcrypt.hash(dto.newPassword, 12);
    user.failedLoginAttempts = 0;
    user.lockUntil = null;

    await this.usersService.save(user);

    return { message: "Password reset successful." };
  }
}
