import { Controller, Post, Get, Body, Param, Query } from "@nestjs/common";
import { ChatMessageService } from "../services/chat-message.service";
import { ContentFilterService } from "../services/content-filter.service";
import { TemplateResponseService } from "../services/template-response.service";
import { CostOptimizationService } from "../services/cost-optimization.service";
import {
  CreateChatMessageDto,
  ChatMessageResponseDto,
} from "../dto/chat-message.dto";

@Controller("chat-processing")
export class ChatProcessingController {
  constructor(
    private readonly chatMessageService: ChatMessageService,
    private readonly contentFilterService: ContentFilterService,
    private readonly templateResponseService: TemplateResponseService,
    private readonly costOptimizationService: CostOptimizationService
  ) {}

  @Post("process")
  async processChatMessage(
    @Body() createChatMessageDto: CreateChatMessageDto
  ): Promise<ChatMessageResponseDto> {
    return this.chatMessageService.processChatMessage(createChatMessageDto);
  }

  @Get("messages/:streamSessionId")
  async getChatMessages(
    @Param("streamSessionId") streamSessionId: string
  ): Promise<ChatMessageResponseDto[]> {
    return this.chatMessageService.getChatMessagesByStreamSession(
      streamSessionId
    );
  }

  @Get("statistics/:streamSessionId")
  async getMessageStatistics(
    @Param("streamSessionId") streamSessionId: string
  ) {
    return this.chatMessageService.getMessageStatistics(streamSessionId);
  }

  @Get("cost-statistics")
  async getCostStatistics() {
    return this.costOptimizationService.getCostStatistics();
  }

  @Get("template-coverage")
  async getTemplateCoverage() {
    return this.templateResponseService.getTemplateCoverage();
  }
}
