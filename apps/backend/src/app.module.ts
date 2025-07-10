import { Module, MiddlewareConsumer, RequestMethod } from "@nestjs/common";
import { ConfigModule, ConfigService } from "@nestjs/config";
import { TypeOrmModule } from "@nestjs/typeorm";
import { createDatabaseConfig } from "./config/database.config";
import { RedisModule } from "./common/services/redis.module";
import { OpenAIModule } from "./common/services/openai.module";
import { WebSocketModule } from "./common/gateways/websocket.module";
import { HealthModule } from "./common/health/health.module";
import { BackupModule } from "./common/services/backup.module";
import { DatabaseMonitoringModule } from "./common/services/database-monitoring.module";
import { BackupAutomationModule } from "./common/modules/backup-automation.module";
import { DatabasePerformanceModule } from "./common/modules/database-performance.module";
import { SecretsModule } from "./common/modules/secrets.module";
import { ChatProcessingModule } from "./modules/chat-processing/chat-processing.module";
import { RateLimitMiddleware } from "./common/middleware/rate-limit.middleware";
import { LoggingMiddleware } from "./common/middleware/logging.middleware";
import { ErrorHandlerMiddleware } from "./common/middleware/error-handler.middleware";
import { CorsMiddleware } from "./common/middleware/cors.middleware";
import { SecurityMiddleware } from "./common/middleware/security.middleware";
import { HelmetMiddleware } from "./common/middleware/helmet.middleware";
import { RequestValidationMiddleware } from "./common/middleware/request-validation.middleware";
import {
  User,
  Game,
  UserGame,
  ChatSession,
  ChatMessage,
  UserSubscription,
} from "./common/database/entities";

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: [".env.local", ".env"],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) =>
        createDatabaseConfig(configService),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([
      User,
      Game,
      UserGame,
      ChatSession,
      ChatMessage,
      UserSubscription,
    ]),
    RedisModule,
    OpenAIModule,
    WebSocketModule,
    HealthModule,
    BackupModule,
    DatabaseMonitoringModule,
    BackupAutomationModule,
    DatabasePerformanceModule,
    SecretsModule,
    ChatProcessingModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply(
        HelmetMiddleware,
        CorsMiddleware,
        SecurityMiddleware,
        RequestValidationMiddleware,
        LoggingMiddleware,
        ErrorHandlerMiddleware,
        RateLimitMiddleware
      )
      .forRoutes({ path: "*", method: RequestMethod.ALL });
  }
}
