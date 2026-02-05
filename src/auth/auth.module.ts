// Auth module wiring: TypeORM OTP repo, JWT, Passport strategy.
import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JwtModule } from "@nestjs/jwt";
import { ConfigService } from "@nestjs/config";
import { PassportModule } from "@nestjs/passport";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { Otp } from "./entities/otp.entity.js";
// ✅ correct
import { UsersModule } from "../users/users.module.js";
import { MailModule } from "../mail/mail.module";
// ✅ correct
import { JwtStrategy } from "./strategies/jwt.strategy.js";

@Module({
  imports: [
    TypeOrmModule.forFeature([Otp]),
    UsersModule,
    MailModule,
    PassportModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const jwt = config.get("jwt") as any;
        return {
          secret: jwt.secret,
          signOptions: { expiresIn: jwt.expiresIn }
        };
      }
    })
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy],
  exports: [JwtModule]
})
export class AuthModule {}
