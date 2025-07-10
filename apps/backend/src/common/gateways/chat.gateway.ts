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
import { Logger, UseGuards } from "@nestjs/common";
import { OpenAIService, ChatMessage } from "../services/openai.service";
import { CacheService } from "../services/cache.service";
import { ConfigService } from "@nestjs/config";

export interface ChatRequest {
  message: string;
  sessionId?: string;
  model?: string;
  temperature?: number;
  maxTokens?: number;
}

export interface ChatResponse {
  message: string;
  sessionId: string;
  timestamp: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export interface ChatSession {
  id: string;
  messages: ChatMessage[];
  createdAt: string;
  lastActivity: string;
}

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || "http://localhost:3000",
    credentials: true,
  },
  namespace: "/chat",
})
export class ChatGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  private readonly logger = new Logger(ChatGateway.name);
  private readonly sessions = new Map<string, ChatSession>();

  constructor(
    private readonly openaiService: OpenAIService,
    private readonly cacheService: CacheService,
    private readonly configService: ConfigService
  ) {}

  afterInit(server: Server) {
    this.logger.log("Chat WebSocket Gateway initialized");
  }

  handleConnection(client: Socket) {
    const sessionId = this.generateSessionId();
    client.data.sessionId = sessionId;

    // Initialize session
    this.sessions.set(sessionId, {
      id: sessionId,
      messages: [],
      createdAt: new Date().toISOString(),
      lastActivity: new Date().toISOString(),
    });

    this.logger.log(
      `Client connected: ${client.id} with session: ${sessionId}`
    );

    // Send session info to client
    client.emit("session_created", { sessionId });
  }

  handleDisconnect(client: Socket) {
    const sessionId = client.data.sessionId;
    if (sessionId) {
      this.sessions.delete(sessionId);
      this.logger.log(
        `Client disconnected: ${client.id}, session: ${sessionId}`
      );
    }
  }

  @SubscribeMessage("send_message")
  async handleMessage(
    @MessageBody() data: ChatRequest,
    @ConnectedSocket() client: Socket
  ): Promise<void> {
    const sessionId = client.data.sessionId || data.sessionId;

    if (!sessionId) {
      client.emit("error", { message: "No session ID provided" });
      return;
    }

    try {
      // Get or create session
      let session = this.sessions.get(sessionId);
      if (!session) {
        session = {
          id: sessionId,
          messages: [],
          createdAt: new Date().toISOString(),
          lastActivity: new Date().toISOString(),
        };
        this.sessions.set(sessionId, session);
      }

      // Update last activity
      session.lastActivity = new Date().toISOString();

      // Add user message to session
      const userMessage: ChatMessage = {
        role: "user",
        content: data.message,
      };
      session.messages.push(userMessage);

      // Check cache first
      const cacheKey = `chat:${sessionId}:${this.hashMessage(data.message)}`;
      const cachedResponse = await this.cacheService.get<string>(cacheKey);

      if (cachedResponse) {
        const response: ChatResponse = {
          message: cachedResponse,
          sessionId,
          timestamp: new Date().toISOString(),
          model: data.model || this.configService.get("OPENAI_MODEL", "gpt-4"),
        };

        client.emit("message_received", response);
        return;
      }

      // Emit typing indicator
      client.emit("typing_started");

      // Prepare messages for OpenAI (include system message if needed)
      const messages: ChatMessage[] = [
        {
          role: "system",
          content:
            "You are StreamBuddy, an AI assistant that helps Indonesian gamers with their streaming and gaming questions. Respond in Indonesian when appropriate, but you can also respond in English. Be helpful, friendly, and knowledgeable about gaming and streaming.",
        },
        ...session.messages.slice(-10), // Keep last 10 messages for context
      ];

      // Get AI response
      const aiResponse = await this.openaiService.chatCompletion(messages, {
        model: data.model || this.configService.get("OPENAI_MODEL", "gpt-4"),
        temperature:
          data.temperature || this.configService.get("OPENAI_TEMPERATURE", 0.7),
        maxTokens:
          data.maxTokens || this.configService.get("OPENAI_MAX_TOKENS", 1000),
        cacheKey,
        cacheTTL: 3600, // Cache for 1 hour
      });

      // Add AI response to session
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: aiResponse,
      };
      session.messages.push(assistantMessage);

      // Emit response
      const response: ChatResponse = {
        message: aiResponse,
        sessionId,
        timestamp: new Date().toISOString(),
        model: data.model || this.configService.get("OPENAI_MODEL", "gpt-4"),
      };

      client.emit("typing_stopped");
      client.emit("message_received", response);

      // Save session to cache
      await this.cacheService.set(`session:${sessionId}`, session, 86400); // 24 hours
    } catch (error) {
      this.logger.error(
        `Error processing message: ${error.message}`,
        error.stack
      );

      client.emit("typing_stopped");
      client.emit("error", {
        message:
          "Sorry, I encountered an error processing your message. Please try again.",
        details: error.message,
      });
    }
  }

  @SubscribeMessage("stream_message")
  async handleStreamMessage(
    @MessageBody() data: ChatRequest,
    @ConnectedSocket() client: Socket
  ): Promise<void> {
    const sessionId = client.data.sessionId || data.sessionId;

    if (!sessionId) {
      client.emit("error", { message: "No session ID provided" });
      return;
    }

    try {
      // Get or create session
      let session = this.sessions.get(sessionId);
      if (!session) {
        session = {
          id: sessionId,
          messages: [],
          createdAt: new Date().toISOString(),
          lastActivity: new Date().toISOString(),
        };
        this.sessions.set(sessionId, session);
      }

      // Update last activity
      session.lastActivity = new Date().toISOString();

      // Add user message to session
      const userMessage: ChatMessage = {
        role: "user",
        content: data.message,
      };
      session.messages.push(userMessage);

      // Emit typing indicator
      client.emit("typing_started");

      // Prepare messages for OpenAI
      const messages: ChatMessage[] = [
        {
          role: "system",
          content:
            "You are StreamBuddy, an AI assistant that helps Indonesian gamers with their streaming and gaming questions. Respond in Indonesian when appropriate, but you can also respond in English. Be helpful, friendly, and knowledgeable about gaming and streaming.",
        },
        ...session.messages.slice(-10),
      ];

      // Stream AI response
      const stream = await this.openaiService.streamChatCompletion(messages, {
        model: data.model || this.configService.get("OPENAI_MODEL", "gpt-4"),
        temperature:
          data.temperature || this.configService.get("OPENAI_TEMPERATURE", 0.7),
        maxTokens:
          data.maxTokens || this.configService.get("OPENAI_MAX_TOKENS", 1000),
      });

      let fullResponse = "";

      // Emit streaming chunks
      for await (const chunk of stream) {
        fullResponse += chunk;
        client.emit("stream_chunk", {
          chunk,
          sessionId,
          timestamp: new Date().toISOString(),
        });
      }

      // Add AI response to session
      const assistantMessage: ChatMessage = {
        role: "assistant",
        content: fullResponse,
      };
      session.messages.push(assistantMessage);

      // Emit completion
      client.emit("typing_stopped");
      client.emit("stream_complete", {
        sessionId,
        timestamp: new Date().toISOString(),
        model: data.model || this.configService.get("OPENAI_MODEL", "gpt-4"),
      });

      // Save session to cache
      await this.cacheService.set(`session:${sessionId}`, session, 86400);
    } catch (error) {
      this.logger.error(
        `Error streaming message: ${error.message}`,
        error.stack
      );

      client.emit("typing_stopped");
      client.emit("error", {
        message:
          "Sorry, I encountered an error processing your message. Please try again.",
        details: error.message,
      });
    }
  }

  @SubscribeMessage("get_session")
  async handleGetSession(
    @MessageBody() data: { sessionId: string },
    @ConnectedSocket() client: Socket
  ): Promise<void> {
    const sessionId = data.sessionId;

    if (!sessionId) {
      client.emit("error", { message: "No session ID provided" });
      return;
    }

    try {
      // Try to get session from cache first
      const cachedSession = await this.cacheService.get<ChatSession>(
        `session:${sessionId}`
      );

      if (cachedSession) {
        this.sessions.set(sessionId, cachedSession);
        client.emit("session_loaded", cachedSession);
      } else {
        client.emit("session_not_found", { sessionId });
      }
    } catch (error) {
      this.logger.error(`Error loading session: ${error.message}`, error.stack);
      client.emit("error", {
        message: "Error loading session",
        details: error.message,
      });
    }
  }

  @SubscribeMessage("clear_session")
  async handleClearSession(
    @MessageBody() data: { sessionId: string },
    @ConnectedSocket() client: Socket
  ): Promise<void> {
    const sessionId = data.sessionId;

    if (!sessionId) {
      client.emit("error", { message: "No session ID provided" });
      return;
    }

    try {
      // Clear session from memory
      this.sessions.delete(sessionId);

      // Clear session from cache
      await this.cacheService.delete(`session:${sessionId}`);

      client.emit("session_cleared", { sessionId });
    } catch (error) {
      this.logger.error(
        `Error clearing session: ${error.message}`,
        error.stack
      );
      client.emit("error", {
        message: "Error clearing session",
        details: error.message,
      });
    }
  }

  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  private hashMessage(message: string): string {
    // Simple hash function for caching
    let hash = 0;
    for (let i = 0; i < message.length; i++) {
      const char = message.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return hash.toString();
  }

  // Get active sessions (for monitoring)
  getActiveSessions(): ChatSession[] {
    return Array.from(this.sessions.values());
  }

  // Get session count (for monitoring)
  getSessionCount(): number {
    return this.sessions.size;
  }
}
