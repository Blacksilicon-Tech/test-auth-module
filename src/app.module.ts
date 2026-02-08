import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import configuration from './config/configuration';
import { AuthModule } from './auth/auth.module';
import { MailModule } from './mail/mail.module';
import { UsersModule } from './users/users.module';
import { DatabaseModule } from './database/database.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true, // ✅ makes process.env available everywhere
      load: [configuration],
    }),
    DatabaseModule,
    MailModule,
    UsersModule,
    AuthModule,
  ],
})
export class AppModule {}
