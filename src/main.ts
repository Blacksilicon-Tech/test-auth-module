// App bootstrap: validation, swagger, and server start.
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
      transform: true
    })
  );

  setupSwagger(app);

  const port = process.env.PORT || 3000;
  await app.listen(port);
}
bootstrap();
