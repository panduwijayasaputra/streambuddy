import { Module } from "@nestjs/common";
import { HealthController } from "./health.controller";
import { HealthService } from "./health.service";
import { RedisModule } from "../services/redis.module";
import { OpenAIModule } from "../services/openai.module";
import { WebSocketModule } from "../gateways/websocket.module";
import { ConfigModule } from "@nestjs/config";

@Module({
  imports: [ConfigModule, RedisModule, OpenAIModule, WebSocketModule],
  controllers: [HealthController],
  providers: [HealthService],
  exports: [HealthService],
})
export class HealthModule {}
