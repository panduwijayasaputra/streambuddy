import { Module } from "@nestjs/common";
import { ChatGateway } from "./chat.gateway";
import { OpenAIModule } from "../services/openai.module";
import { RedisModule } from "../services/redis.module";

@Module({
  imports: [OpenAIModule, RedisModule],
  providers: [ChatGateway],
  exports: [ChatGateway],
})
export class WebSocketModule {}
