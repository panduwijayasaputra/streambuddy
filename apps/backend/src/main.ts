import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { WebSocketAdapter } from "./common/adapters/websocket.adapter";
import { GlobalExceptionFilter } from "./common/filters/global-exception.filter";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);

  // Enable CORS
  app.enableCors({
    origin: configService.get("FRONTEND_URL", "http://localhost:3000"),
    credentials: true,
  });

  // Use WebSocket adapter
  app.useWebSocketAdapter(new WebSocketAdapter(configService));

  // Global exception filter
  app.useGlobalFilters(new GlobalExceptionFilter(configService));

  // Global validation pipe
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    })
  );

  const port = configService.get("PORT", 3001);
  await app.listen(port);

  console.log(`🚀 StreamBuddy Backend is running on: http://localhost:${port}`);
  console.log(`📡 WebSocket server is running on: ws://localhost:${port}/chat`);
}

bootstrap();
