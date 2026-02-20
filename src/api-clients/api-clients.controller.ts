import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { ApiExcludeController } from '@nestjs/swagger';
import { AuthApiService } from './auth-api.service';
import { ExternalApiService } from './external-api.service';

@ApiExcludeController()
@Controller('api/clients')
export class ApiClientsController {
  constructor(private readonly authApi: AuthApiService, private readonly externalApi: ExternalApiService) {}

  @Post('auth/signup')
  signup(@Body() body: any) {
    return this.authApi.signup(body);
  }

  @Post('auth/signin')
  signin(@Body() body: any) {
    return this.authApi.signin(body);
  }

  @Get('external/todo/:id')
  getTodo(@Param('id') id: string) {
    return this.externalApi.getTodo(id);
  }
}
