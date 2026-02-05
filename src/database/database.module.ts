import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule, ConfigService } from "@nestjs/config";

// ESM-safe entity imports
import { User } from "../users/entities/user.entity.js";
import { Otp } from "../auth/entities/otp.entity.js";

@Module({
  imports: [
    ConfigModule,
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => {
        const db = config.get<{
          host: string;
          port: number;
          username: string; // changed from user
          password: string; // changed from pass
          database: string; // changed from name
        }>("db");

        if (!db) {
          throw new Error("Database configuration (db) is missing");
        }

        return {
          type: "postgres",
          host: db.host,
          port: db.port,
          username: db.username, // now matches configuration.ts
          password: db.password, // now matches configuration.ts
          database: db.database, // now matches configuration.ts
          entities: [User, Otp],
          synchronize: true, // dev only
          logging: false
        };
      }
    })
  ]
})
export class DatabaseModule {}