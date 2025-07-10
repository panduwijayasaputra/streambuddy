import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
  OnGatewayInit,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { Logger } from "@nestjs/common";
import { ChatMessageService } from "../services/chat-message.service";
import { ContentFilterService } from "../services/content-filter.service";
import { TemplateResponseService } from "../services/template-response.service";
import { AiResponseService } from "../services/ai-response.service";
import { GameKnowledgeService } from "../services/game-knowledge.service";
import { CostOptimizationService } from "../services/cost-optimization.service";
import { CreateChatMessageDto } from "../dto/chat-message.dto";

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  },
  namespace: "/chat-processing",
})
export class ChatProcessingGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatProcessingGateway.name);
  private readonly connectedClients = new Map<string, Socket>();
  private readonly streamSessions = new Map<string, Set<string>>(); // streamSessionId -> Set of clientIds

  constructor(
    private readonly chatMessageService: ChatMessageService,
    private readonly contentFilterService: ContentFilterService,
    private readonly templateResponseService: TemplateResponseService,
    private readonly aiResponseService: AiResponseService,
    private readonly gameKnowledgeService: GameKnowledgeService,
    private readonly costOptimizationService: CostOptimizationService
  ) {}

  afterInit(server: Server) {
    this.logger.log("Chat Processing WebSocket Gateway initialized");
  }

  handleConnection(client: Socket) {
    this.connectedClients.set(client.id, client);
    this.logger.log(`Client connected: ${client.id}`);

    // Send connection confirmation
    client.emit("connected", {
      clientId: client.id,
      timestamp: new Date().toISOString(),
    });
  }

  handleDisconnect(client: Socket) {
    this.connectedClients.delete(client.id);

    // Remove client from all stream sessions
    for (const [streamSessionId, clients] of this.streamSessions.entries()) {
      clients.delete(client.id);
      if (clients.size === 0) {
        this.streamSessions.delete(streamSessionId);
      }
    }

    this.logger.log(`Client disconnected: ${client.id}`);
  }

  @SubscribeMessage("chat.message")
  async handleChatMessage(
    @MessageBody() data: CreateChatMessageDto,
    @ConnectedSocket() client: Socket
  ) {
    try {
      this.logger.log(
        `Processing chat message from ${data.username}: ${data.message}`
      );

      // Process the chat message
      const chatMessage =
        await this.chatMessageService.processChatMessage(data);

      // Filter the message
      const filterResult = await this.contentFilterService.filterMessage(
        data.message,
        data.username
      );

      // Get game context
      const gameContext = await this.gameKnowledgeService.getGameContext(
        data.message
      );

      // Emit processing result back to client
      client.emit("chat.processed", {
        messageId: chatMessage.id,
        shouldProcess: filterResult.shouldProcess,
        reason: filterResult.reason,
        priority: filterResult.priority,
        gameContext,
        timestamp: new Date().toISOString(),
      });

      // If message should be processed, generate response
      if (filterResult.shouldProcess) {
        await this.generateAndEmitResponse(
          data,
          chatMessage,
          gameContext,
          client
        );
      } else {
        // Update message status to filtered
        await this.chatMessageService.updateMessageStatus(
          chatMessage.id,
          "filtered",
          null
        );
      }

      // Broadcast to stream session
      this.server
        .to(`stream:${data.streamSessionId}`)
        .emit("chat.message.received", {
          id: chatMessage.id,
          username: chatMessage.username,
          message: data.message,
          status: filterResult.shouldProcess ? "processed" : "filtered",
          gameContext,
          timestamp: new Date().toISOString(),
        });
    } catch (error) {
      this.logger.error(`Error processing chat message: ${error.message}`);
      client.emit("chat.error", {
        message: "Error processing chat message",
        error: error.message,
      });
    }
  }

  private async generateAndEmitResponse(
    data: CreateChatMessageDto,
    chatMessage: any,
    gameContext: string | null,
    client: Socket
  ) {
    try {
      // Try template response first
      const templateResponse =
        await this.templateResponseService.findTemplateResponse(
          data.message,
          gameContext
        );

      if (templateResponse) {
        // Use template response
        await this.chatMessageService.updateMessageStatus(
          chatMessage.id,
          "responded",
          templateResponse
        );

        client.emit("chat.response", {
          messageId: chatMessage.id,
          response: templateResponse,
          type: "template",
          gameContext,
          timestamp: new Date().toISOString(),
        });

        return;
      }

      // Check if AI response is needed
      const requiresAiResponse =
        await this.aiResponseService.requiresAiResponse(data.message);

      if (requiresAiResponse) {
        // Check cost budget
        const isWithinBudget =
          await this.costOptimizationService.isWithinBudget();

        if (!isWithinBudget) {
          client.emit("chat.response", {
            messageId: chatMessage.id,
            response:
              "Maaf, sistem sedang dalam maintenance. Silakan coba lagi nanti.",
            type: "fallback",
            gameContext,
            timestamp: new Date().toISOString(),
          });
          return;
        }

        // Generate AI response
        const aiResponse = await this.aiResponseService.generateResponse(
          data.message,
          gameContext
        );

        // Track cost
        const cost = await this.aiResponseService.getResponseCost(data.message);
        await this.costOptimizationService.trackApiCall(cost);

        await this.chatMessageService.updateMessageStatus(
          chatMessage.id,
          "responded",
          aiResponse
        );

        client.emit("chat.response", {
          messageId: chatMessage.id,
          response: aiResponse,
          type: "ai",
          gameContext,
          cost,
          timestamp: new Date().toISOString(),
        });
      } else {
        // No response needed
        await this.chatMessageService.updateMessageStatus(
          chatMessage.id,
          "processed",
          null
        );
      }
    } catch (error) {
      this.logger.error(`Error generating response: ${error.message}`);

      // Fallback response
      client.emit("chat.response", {
        messageId: chatMessage.id,
        response: "Maaf, terjadi kesalahan dalam memproses pesan Anda.",
        type: "fallback",
        gameContext,
        timestamp: new Date().toISOString(),
      });
    }
  }

  @SubscribeMessage("join.stream")
  async handleJoinStream(
    @MessageBody() data: { streamSessionId: string },
    @ConnectedSocket() client: Socket
  ) {
    try {
      client.join(`stream:${data.streamSessionId}`);

      // Track client in stream session
      if (!this.streamSessions.has(data.streamSessionId)) {
        this.streamSessions.set(data.streamSessionId, new Set());
      }
      this.streamSessions.get(data.streamSessionId)?.add(client.id);

      this.logger.log(
        `Client ${client.id} joined stream: ${data.streamSessionId}`
      );

      client.emit("stream.joined", {
        streamSessionId: data.streamSessionId,
        timestamp: new Date().toISOString(),
      });

      // Send stream statistics
      const statistics = await this.chatMessageService.getMessageStatistics(
        data.streamSessionId
      );
      client.emit("stream.statistics", {
        streamSessionId: data.streamSessionId,
        statistics,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error(`Error joining stream: ${error.message}`);
      client.emit("stream.error", {
        message: "Error joining stream",
        error: error.message,
      });
    }
  }

  @SubscribeMessage("leave.stream")
  async handleLeaveStream(
    @MessageBody() data: { streamSessionId: string },
    @ConnectedSocket() client: Socket
  ) {
    try {
      client.leave(`stream:${data.streamSessionId}`);

      // Remove client from stream session tracking
      const clients = this.streamSessions.get(data.streamSessionId);
      if (clients) {
        clients.delete(client.id);
        if (clients.size === 0) {
          this.streamSessions.delete(data.streamSessionId);
        }
      }

      this.logger.log(
        `Client ${client.id} left stream: ${data.streamSessionId}`
      );

      client.emit("stream.left", {
        streamSessionId: data.streamSessionId,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error(`Error leaving stream: ${error.message}`);
      client.emit("stream.error", {
        message: "Error leaving stream",
        error: error.message,
      });
    }
  }

  @SubscribeMessage("get.statistics")
  async handleGetStatistics(
    @MessageBody() data: { streamSessionId: string },
    @ConnectedSocket() client: Socket
  ) {
    try {
      const statistics = await this.chatMessageService.getMessageStatistics(
        data.streamSessionId
      );
      const costStats = await this.costOptimizationService.getCostStatistics();

      client.emit("statistics", {
        streamSessionId: data.streamSessionId,
        messageStatistics: statistics,
        costStatistics: costStats,
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      this.logger.error(`Error getting statistics: ${error.message}`);
      client.emit("statistics.error", {
        message: "Error getting statistics",
        error: error.message,
      });
    }
  }

  @SubscribeMessage("ping")
  async handlePing(@ConnectedSocket() client: Socket) {
    client.emit("pong", {
      timestamp: new Date().toISOString(),
      clientId: client.id,
    });
  }
}
