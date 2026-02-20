import { Injectable, Logger } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

interface TokenCache {
  accessToken: string | null;
  expiresAt: number; // epoch ms
}

@Injectable()
export class OAuth2HttpService {
  private readonly logger = new Logger(OAuth2HttpService.name);
  private token: TokenCache = { accessToken: null, expiresAt: 0 };

  constructor(private readonly http: HttpService, private readonly config: ConfigService) {}

  private async fetchToken(): Promise<void> {
    const tokenUrl = this.config.get<string>('OAUTH_TOKEN_URL');
    const clientId = this.config.get<string>('OAUTH_CLIENT_ID');
    const clientSecret = this.config.get<string>('OAUTH_CLIENT_SECRET');

    if (!tokenUrl || !clientId || !clientSecret) {
      this.logger.warn('OAuth2 configuration missing; skipping token fetch');
      this.token = { accessToken: null, expiresAt: 0 };
      return;
    }

    try {
      const resp$ = this.http.post(
        tokenUrl,
        new URLSearchParams({ grant_type: 'client_credentials' }).toString(),
        {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
          },
          auth: {
            username: clientId,
            password: clientSecret,
          } as any,
        },
      );

      const resp = await firstValueFrom(resp$);
      const data = resp.data;
      const accessToken = data.access_token;
      const expiresIn = Number(data.expires_in) || 3600;
      this.token = { accessToken, expiresAt: Date.now() + expiresIn * 1000 - 1000 };
    } catch (err) {
      this.logger.warn('Failed to fetch OAuth2 token: ' + (err?.message ?? String(err)));
      this.token = { accessToken: null, expiresAt: 0 };
    }
  }

  private async ensureToken(): Promise<string | null> {
    if (!this.token.accessToken || Date.now() >= this.token.expiresAt) {
      await this.fetchToken();
    }
    return this.token.accessToken;
  }

  async request<T = any>(method: 'get' | 'post' | 'put' | 'patch' | 'delete', url: string, options: any = {}): Promise<T> {
    const accessToken = await this.ensureToken();
    const headers = options.headers || {};
    if (accessToken) headers['Authorization'] = `Bearer ${accessToken}`;

    // Log outgoing request
    this.logger.log(`Outgoing request: ${method.toUpperCase()} ${url}`);

    try {
      const resp$ = this.http.request({ method, url, ...options, headers });
      const resp = await firstValueFrom(resp$);
      // Log response status
      this.logger.log(`Response: ${method.toUpperCase()} ${url} -> ${resp.status} ${resp.statusText || ''}`);
      return resp.data as T;
    } catch (err: any) {
      // Axios error shape
      const status = err?.response?.status;
      const statusText = err?.response?.statusText || err?.message;
      this.logger.warn(`Request failed: ${method.toUpperCase()} ${url} -> ${status || 'N/A'} ${statusText}`);
      throw err;
    }
  }
}
