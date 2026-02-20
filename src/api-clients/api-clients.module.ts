import { Module } from '@nestjs/common';
import { HttpModule } from '@nestjs/axios';
import { ConfigModule } from '@nestjs/config';
import { OAuth2HttpService } from '../common/oauth2-http.service';
import { AuthApiService } from './auth-api.service';
import { ExternalApiService } from './external-api.service';
import { ApiClientsController } from './api-clients.controller';
import { ProxyAuthController } from './proxy-auth.controller';

@Module({
  imports: [HttpModule, ConfigModule],
  providers: [OAuth2HttpService, AuthApiService, ExternalApiService],
  controllers: [ApiClientsController, ProxyAuthController],
  exports: [AuthApiService, ExternalApiService],
})
export class ApiClientsModule {}
