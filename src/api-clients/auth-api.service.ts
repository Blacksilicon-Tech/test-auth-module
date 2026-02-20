import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2HttpService } from '../common/oauth2-http.service';

@Injectable()
export class AuthApiService {
  private readonly baseUrl: string;

  constructor(private readonly oauth2: OAuth2HttpService, private readonly config: ConfigService) {
    this.baseUrl = this.config.get<string>('AUTH_API_BASE') || 'http://localhost:3000/auth';
  }

  signup(body: any) {
    return this.oauth2.request('post', `${this.baseUrl}/signup`, { data: body });
  }

  verifyEmail(body: any) {
    return this.oauth2.request('post', `${this.baseUrl}/verify-email`, { data: body });
  }

  signin(body: any) {
    return this.oauth2.request('post', `${this.baseUrl}/signin`, { data: body });
  }

  forgotPassword(body: any) {
    return this.oauth2.request('post', `${this.baseUrl}/forgot-password`, { data: body });
  }

  resetPassword(body: any) {
    return this.oauth2.request('post', `${this.baseUrl}/reset-password`, { data: body });
  }

  getProfile(token?: string) {
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    return this.oauth2.request('get', `${this.baseUrl}/profile`, { headers });
  }

  updateProfile(body: any, token?: string) {
    const headers = token ? { Authorization: `Bearer ${token}` } : undefined;
    return this.oauth2.request('patch', `${this.baseUrl}/profile`, { data: body, headers });
  }
}
