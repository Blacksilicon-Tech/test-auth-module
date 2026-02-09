import "reflect-metadata";
import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { setupSwagger } from "./common/swagger/swagger.config.js";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Global DTO validation + whitelisting
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  // Swagger setup
  setupSwagger(app);

  const port = process.env.PORT || 3000;
  await app.listen(port);

  // 🔥 Startup logs (very important)
  const serverUrl = `http://localhost:${port}`;

  console.log("🚀 Auth Module API started successfully");
  console.log(`🌐 Server running at: ${serverUrl}`);
  console.log(`📚 Swagger docs available at: ${serverUrl}/docs`);
}

bootstrap();
