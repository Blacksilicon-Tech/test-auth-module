import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { OAuth2HttpService } from '../common/oauth2-http.service';

@Injectable()
export class ExternalApiService {
  private readonly baseUrl: string;

  constructor(private readonly oauth2: OAuth2HttpService, private readonly config: ConfigService) {
    this.baseUrl = this.config.get<string>('EXTERNAL_API_BASE') || 'https://jsonplaceholder.typicode.com';
  }

  async getTodo(id: number | string = 1) {
    return this.oauth2.request('get', `${this.baseUrl}/todos/${id}`);
  }
}
