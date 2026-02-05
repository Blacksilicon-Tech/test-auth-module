import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";

// ESM-safe imports
import configuration from "./config/configuration.js";
import { MailModule } from "./mail/mail.module.js";
import { UsersModule } from "./users/users.module.js";
import { AuthModule } from "./auth/auth.module.js";
import { DatabaseModule } from "./database/database.module.js";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration]
    }),
    DatabaseModule,
    MailModule,
    UsersModule,
    AuthModule
  ]
})
export class AppModule {}