import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { ChatMessageService } from "../services/chat-message.service";
import { ContentFilterService } from "../services/content-filter.service";
import { CreateChatMessageDto } from "../dto/chat-message.dto";

@WebSocketGateway({
  cors: {
    origin: "*",
  },
})
export class ChatProcessingGateway {
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly chatMessageService: ChatMessageService,
    private readonly contentFilterService: ContentFilterService
  ) {}

  @SubscribeMessage("chat.message")
  async handleChatMessage(
    @MessageBody() data: CreateChatMessageDto,
    @ConnectedSocket() client: Socket
  ) {
    try {
      // Process the chat message
      const chatMessage =
        await this.chatMessageService.processChatMessage(data);

      // Filter the message
      const filterResult = await this.contentFilterService.filterMessage(
        data.message,
        data.username
      );

      // Emit result back to client
      client.emit("chat.processed", {
        messageId: chatMessage.id,
        shouldProcess: filterResult.shouldProcess,
        reason: filterResult.reason,
        priority: filterResult.priority,
      });

      // Broadcast to all connected clients
      this.server.emit("chat.message.received", {
        id: chatMessage.id,
        username: chatMessage.username,
        message: chatMessage.message,
        timestamp: chatMessage.createdAt,
      });
    } catch (error) {
      client.emit("chat.error", {
        message: "Error processing chat message",
        error: error.message,
      });
    }
  }

  @SubscribeMessage("join.stream")
  async handleJoinStream(
    @MessageBody() data: { streamSessionId: string },
    @ConnectedSocket() client: Socket
  ) {
    client.join(`stream:${data.streamSessionId}`);
    client.emit("stream.joined", { streamSessionId: data.streamSessionId });
  }

  @SubscribeMessage("leave.stream")
  async handleLeaveStream(
    @MessageBody() data: { streamSessionId: string },
    @ConnectedSocket() client: Socket
  ) {
    client.leave(`stream:${data.streamSessionId}`);
    client.emit("stream.left", { streamSessionId: data.streamSessionId });
  }
}
