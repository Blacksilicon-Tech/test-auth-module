import { Controller, Post, Body, Get, Patch, Headers, HttpException, HttpStatus, BadRequestException } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { AuthApiService } from './auth-api.service';

@ApiExcludeController()
@Controller('proxy/auth')
export class ProxyAuthController {
  constructor(private readonly authApi: AuthApiService) {}

  @Post('signup')
  async signup(@Body() body: any) {
    try {
      return await this.authApi.signup(body);
    } catch (err: any) {
      const status = err?.response?.status || HttpStatus.SERVICE_UNAVAILABLE;
      const message = err?.response?.data?.message || 'External auth service unavailable';
      throw new HttpException(message, status);
    }
  }

  @Get('signup')
  getSignupInfo() {
    return {
      message: 'This endpoint accepts POST requests to create a user. Use POST /proxy/auth/signup with JSON body.',
      exampleBody: {
        email: 'user@example.com',
        password: 'securePassword',
        name: 'Full Name'
      }
    };
  }

  @Post('verify-email')
  async verifyEmail(@Body() body: any) {
    try {
      return await this.authApi.verifyEmail(body);
    } catch (err: any) {
      const status = err?.response?.status || HttpStatus.SERVICE_UNAVAILABLE;
      const message = err?.response?.data?.message || 'External auth service unavailable';
      throw new HttpException(message, status);
    }
  }

  @Get('verify-email')
  getVerifyEmailInfo() {
    return {
      message: 'This endpoint accepts POST requests to verify email with OTP. Use POST /proxy/auth/verify-email with JSON body.',
      exampleBody: {
        email: 'user@example.com',
        otp: '123456'
      }
    };
  }

  @Post('signin')
  async signin(@Body() body: any) {
    try {
      return await this.authApi.signin(body);
    } catch (err: any) {
      const status = err?.response?.status || HttpStatus.SERVICE_UNAVAILABLE;
      const message = err?.response?.data?.message || 'External auth service unavailable';
      throw new HttpException(message, status);
    }
  }

  @Get('signin')
  getSigninInfo() {
    return {
      message: 'This endpoint accepts POST requests to authenticate. Use POST /proxy/auth/signin with JSON body.',
      exampleBody: {
        email: 'user@example.com',
        password: 'securePassword'
      }
    };
  }

  @Post('forgot-password')
  async forgotPassword(@Body() body: any) {
    try {
      return await this.authApi.forgotPassword(body);
    } catch (err: any) {
      const status = err?.response?.status || HttpStatus.SERVICE_UNAVAILABLE;
      const message = err?.response?.data?.message || 'External auth service unavailable';
      throw new HttpException(message, status);
    }
  }

  @Get('forgot-password')
  getForgotPasswordInfo() {
    return {
      message: 'This endpoint accepts POST requests to initiate password reset via OTP. Use POST /proxy/auth/forgot-password with JSON body.',
      exampleBody: {
        email: 'user@example.com'
      }
    };
  }

  @Post('reset-password')
  async resetPassword(@Body() body: any) {
    try {
      return await this.authApi.resetPassword(body);
    } catch (err: any) {
      const status = err?.response?.status || HttpStatus.SERVICE_UNAVAILABLE;
      const message = err?.response?.data?.message || 'External auth service unavailable';
      throw new HttpException(message, status);
    }
  }

  @Get('reset-password')
  getResetPasswordInfo() {
    return {
      message: 'This endpoint accepts POST requests to reset password using OTP. Use POST /proxy/auth/reset-password with JSON body.',
      exampleBody: {
        email: 'user@example.com',
        otp: '123456',
        newPassword: 'newSecurePassword'
      }
    };
  }

  @Get('profile')
  async getProfile(@Headers('authorization') authorization?: string) {
    try {
      const token = authorization?.startsWith('Bearer ') ? authorization.split(' ')[1] : authorization;
      return await this.authApi.getProfile(token);
    } catch (err: any) {
      const status = err?.response?.status || HttpStatus.SERVICE_UNAVAILABLE;
      const message = err?.response?.data?.message || 'External auth service unavailable';
      throw new HttpException(message, status);
    }
  }

  @Patch('profile')
  async updateProfile(@Body() body: any, @Headers('authorization') authorization?: string) {
    try {
      const token = authorization?.startsWith('Bearer ') ? authorization.split(' ')[1] : authorization;
      return await this.authApi.updateProfile(body, token);
    } catch (err: any) {
      const status = err?.response?.status || HttpStatus.SERVICE_UNAVAILABLE;
      const message = err?.response?.data?.message || 'External auth service unavailable';
      throw new HttpException(message, status);
    }
  }
}
