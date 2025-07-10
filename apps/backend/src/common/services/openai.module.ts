import { Module } from "@nestjs/common";
import { OpenAIService } from "./openai.service";
import { RedisModule } from "./redis.module";

@Module({
  imports: [RedisModule],
  providers: [OpenAIService],
  exports: [OpenAIService],
})
export class OpenAIModule {}
