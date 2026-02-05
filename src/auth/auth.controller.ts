// REST endpoints required by the spec (signup, verify OTP, signin, reset).
import { Body, Controller, Post } from "@nestjs/common";
import { ApiTags } from "@nestjs/swagger";
import { AuthService } from "./auth.service";
import { SignupDto } from "./dto/signup.dto";
import { VerifyEmailDto } from "./dto/verify-email.dto";
import { SigninDto } from "./dto/signin.dto";
import { RequestPasswordResetDto } from './dto/request-password-reset.dto.js';
import { ConfirmPasswordResetDto } from "./dto/confirm-password-reset.dto";

@ApiTags("Auth")
@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("signup")
  signup(@Body() dto: SignupDto) {
    return this.authService.signup(dto);
  }

  @Post("verify-email")
  verifyEmail(@Body() dto: VerifyEmailDto) {
    return this.authService.verifyEmail(dto);
  }

  @Post("signin")
  signin(@Body() dto: SigninDto) {
    return this.authService.signin(dto);
  }

  @Post("password-reset/request")
  requestReset(@Body() dto: RequestPasswordResetDto) {
    return this.authService.requestPasswordReset(dto);
  }

  @Post("password-reset/confirm")
  confirmReset(@Body() dto: ConfirmPasswordResetDto) {
    return this.authService.confirmPasswordReset(dto);
  }
}
