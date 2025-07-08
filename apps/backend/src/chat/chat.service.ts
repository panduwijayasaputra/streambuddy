import { Injectable } from "@nestjs/common";
import { Repository } from "typeorm";
import { ChatMessageEntity } from "./chat-message.entity";
import { MentionService } from "../mention/mention.service";
import { QAEngineService } from "../qa/qa-engine.service";

export interface ChatMessage {
  userId: string;
  message: string;
  platform: "youtube" | "twitch" | "other";
  streamId?: string;
  timestamp: Date;
  game?: "mobile_legends" | "free_fire" | "valorant"; // Add game context
}

@Injectable()
export class ChatService {
  private lastMessages: Map<string, string> = new Map(); // userId -> last message

  constructor(
    private readonly chatRepo: Repository<ChatMessageEntity>,
    private readonly mentionService: MentionService,
    private readonly qaEngine: QAEngineService
  ) {}

  // Ingest chat message via WebSocket
  async handleWebSocketMessage(msg: ChatMessage): Promise<void> {
    if (!this.isRelevant(msg)) return;
    await this.saveMessageWithAIResponse(msg);
  }

  // Ingest chat message via REST endpoint
  async handleRestMessage(msg: ChatMessage): Promise<void> {
    if (!this.isRelevant(msg)) return;
    await this.saveMessageWithAIResponse(msg);
  }

  // Filtering and preprocessing logic
  private isRelevant(msg: ChatMessage): boolean {
    if (!msg.message || msg.message.trim().length === 0) return false;
    const last = this.lastMessages.get(msg.userId);
    if (last && last === msg.message.trim()) return false;
    this.lastMessages.set(msg.userId, msg.message.trim());
    if (!this.mentionService.isMentioned(msg.message)) return false;
    return true;
  }

  // Store message in the database, with AI response
  private async saveMessageWithAIResponse(msg: ChatMessage): Promise<void> {
    // Default to 'mobile_legends' if game is not provided
    const game = msg.game || "mobile_legends";
    const aiResponse = await this.qaEngine.getResponse(game, msg.message);
    const entity = this.chatRepo.create({
      userId: msg.userId,
      message: msg.message,
      platform: msg.platform,
      streamId: msg.streamId,
      processed: true,
      aiResponse,
      createdAt: msg.timestamp,
    });
    await this.chatRepo.save(entity);
  }
}
