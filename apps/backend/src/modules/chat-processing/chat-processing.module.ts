import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { ConfigModule } from "@nestjs/config";
import { CacheModule } from "@nestjs/cache-manager";
import { EventEmitterModule } from "@nestjs/event-emitter";

// Services
import { ChatMessageService } from "./services/chat-message.service";
import { ContentFilterService } from "./services/content-filter.service";
import { AiResponseService } from "./services/ai-response.service";
import { TemplateResponseService } from "./services/template-response.service";
import { GameKnowledgeService } from "./services/game-knowledge.service";
import { CostOptimizationService } from "./services/cost-optimization.service";

// Controllers
import { ChatProcessingController } from "./controllers/chat-processing.controller";

// WebSocket Gateway
import { ChatProcessingGateway } from "./websocket/chat-processing.gateway";

// Entities
import { ChatMessage } from "./entities/chat-message.entity";
import { ResponseTemplate } from "./entities/response-template.entity";
import { GameKnowledge } from "./entities/game-knowledge.entity";

// Utilities
import { IndonesianLanguageUtil } from "./utils/indonesian-language.util";
import { ResponseValidatorUtil } from "./utils/response-validator.util";

@Module({
  imports: [
    TypeOrmModule.forFeature([ChatMessage, ResponseTemplate, GameKnowledge]),
    ConfigModule,
    CacheModule.register({
      ttl: 300, // 5 minutes cache for template responses
      max: 1000, // Maximum 1000 cached items
    }),
    EventEmitterModule.forRoot(),
  ],
  controllers: [ChatProcessingController],
  providers: [
    // Core Services
    ChatMessageService,
    ContentFilterService,
    AiResponseService,
    TemplateResponseService,
    GameKnowledgeService,
    CostOptimizationService,

    // WebSocket Gateway
    ChatProcessingGateway,

    // Utilities
    IndonesianLanguageUtil,
    ResponseValidatorUtil,
  ],
  exports: [
    ChatMessageService,
    ContentFilterService,
    AiResponseService,
    TemplateResponseService,
    GameKnowledgeService,
    CostOptimizationService,
    ChatProcessingGateway,
  ],
})
export class ChatProcessingModule {}
