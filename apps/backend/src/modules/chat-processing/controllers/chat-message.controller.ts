import {
  Controller,
  Post,
  Get,
  Body,
  Param,
  Query,
  HttpCode,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from "@nestjs/swagger";
import { ChatMessageService } from "../services/chat-message.service";
import { CreateChatMessageDto } from "../dto/chat-message.dto";

@ApiTags("Chat Messages")
@Controller("chat-messages")
export class ChatMessageController {
  private readonly logger = new Logger(ChatMessageController.name);

  constructor(private readonly chatMessageService: ChatMessageService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Process a single chat message" })
  @ApiResponse({
    status: 201,
    description: "Chat message processed successfully",
  })
  @ApiResponse({
    status: 400,
    description: "Invalid chat message data",
  })
  async processChatMessage(@Body() createChatMessageDto: CreateChatMessageDto) {
    this.logger.log(
      `Processing chat message from ${createChatMessageDto.username}`
    );
    return this.chatMessageService.processChatMessage(createChatMessageDto);
  }

  @Post("bulk")
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({ summary: "Process multiple chat messages in bulk" })
  @ApiResponse({
    status: 201,
    description: "Chat messages processed successfully",
  })
  @ApiResponse({
    status: 400,
    description: "Invalid chat message data",
  })
  async bulkProcessChatMessages(@Body() messages: CreateChatMessageDto[]) {
    this.logger.log(`Processing ${messages.length} chat messages in bulk`);
    return this.chatMessageService.bulkInsertMessages(messages);
  }

  @Get("stream/:streamSessionId")
  @ApiOperation({ summary: "Get chat messages by stream session" })
  @ApiParam({ name: "streamSessionId", description: "Stream session ID" })
  @ApiQuery({
    name: "limit",
    required: false,
    description: "Number of messages to return",
  })
  @ApiResponse({
    status: 200,
    description: "Chat messages retrieved successfully",
  })
  async getChatMessagesByStreamSession(
    @Param("streamSessionId") streamSessionId: string,
    @Query("limit") limit?: number
  ) {
    return this.chatMessageService.getChatMessagesByStreamSession(
      streamSessionId
    );
  }

  @Get("stream/:streamSessionId/recent")
  @ApiOperation({ summary: "Get recent chat messages for real-time display" })
  @ApiParam({ name: "streamSessionId", description: "Stream session ID" })
  @ApiQuery({
    name: "limit",
    required: false,
    description: "Number of messages to return",
  })
  @ApiResponse({
    status: 200,
    description: "Recent chat messages retrieved successfully",
  })
  async getRecentMessages(
    @Param("streamSessionId") streamSessionId: string,
    @Query("limit") limit: number = 20
  ) {
    return this.chatMessageService.getRecentMessages(streamSessionId, limit);
  }

  @Get("stream/:streamSessionId/status/:status")
  @ApiOperation({ summary: "Get chat messages by status" })
  @ApiParam({ name: "streamSessionId", description: "Stream session ID" })
  @ApiParam({ name: "status", description: "Message status" })
  @ApiQuery({
    name: "limit",
    required: false,
    description: "Number of messages to return",
  })
  @ApiResponse({
    status: 200,
    description: "Chat messages retrieved successfully",
  })
  async getMessagesByStatus(
    @Param("streamSessionId") streamSessionId: string,
    @Param("status")
    status: "pending" | "processed" | "filtered" | "responded" | "error",
    @Query("limit") limit: number = 50
  ) {
    return this.chatMessageService.getMessagesByStatus(
      streamSessionId,
      status,
      limit
    );
  }

  @Get("stream/:streamSessionId/game/:gameContext")
  @ApiOperation({ summary: "Get chat messages by game context" })
  @ApiParam({ name: "streamSessionId", description: "Stream session ID" })
  @ApiParam({ name: "gameContext", description: "Game context" })
  @ApiQuery({
    name: "limit",
    required: false,
    description: "Number of messages to return",
  })
  @ApiResponse({
    status: 200,
    description: "Chat messages retrieved successfully",
  })
  async getMessagesByGameContext(
    @Param("streamSessionId") streamSessionId: string,
    @Param("gameContext") gameContext: string,
    @Query("limit") limit: number = 50
  ) {
    return this.chatMessageService.getMessagesByGameContext(
      streamSessionId,
      gameContext,
      limit
    );
  }

  @Get("stream/:streamSessionId/user/:userId")
  @ApiOperation({ summary: "Get chat messages by user" })
  @ApiParam({ name: "streamSessionId", description: "Stream session ID" })
  @ApiParam({ name: "userId", description: "User ID" })
  @ApiQuery({
    name: "limit",
    required: false,
    description: "Number of messages to return",
  })
  @ApiResponse({
    status: 200,
    description: "Chat messages retrieved successfully",
  })
  async getMessagesByUser(
    @Param("streamSessionId") streamSessionId: string,
    @Param("userId") userId: string,
    @Query("limit") limit: number = 50
  ) {
    return this.chatMessageService.getMessagesByUser(
      streamSessionId,
      userId,
      limit
    );
  }

  @Get("stream/:streamSessionId/statistics")
  @ApiOperation({ summary: "Get chat message statistics" })
  @ApiParam({ name: "streamSessionId", description: "Stream session ID" })
  @ApiResponse({
    status: 200,
    description: "Chat message statistics retrieved successfully",
  })
  async getMessageStatistics(
    @Param("streamSessionId") streamSessionId: string
  ) {
    return this.chatMessageService.getMessageStatistics(streamSessionId);
  }

  @Get("stream/:streamSessionId/analytics")
  @ApiOperation({ summary: "Get detailed chat message analytics" })
  @ApiParam({ name: "streamSessionId", description: "Stream session ID" })
  @ApiResponse({
    status: 200,
    description: "Chat message analytics retrieved successfully",
  })
  async getMessageAnalytics(@Param("streamSessionId") streamSessionId: string) {
    return this.chatMessageService.getMessageAnalytics(streamSessionId);
  }
}
