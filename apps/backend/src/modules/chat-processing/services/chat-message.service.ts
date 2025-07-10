import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { ChatMessage } from "../entities/chat-message.entity";
import { CreateChatMessageDto } from "../dto/chat-message.dto";

@Injectable()
export class ChatMessageService {
  private readonly logger = new Logger(ChatMessageService.name);

  constructor(
    @InjectRepository(ChatMessage)
    private readonly chatMessageRepository: Repository<ChatMessage>,
    private readonly eventEmitter: EventEmitter2
  ) {}

  /**
   * Process incoming chat message
   */
  async processChatMessage(
    createChatMessageDto: CreateChatMessageDto
  ): Promise<ChatMessage> {
    try {
      // Create chat message entity
      const chatMessage = this.chatMessageRepository.create({
        ...createChatMessageDto,
        processedAt: new Date(),
        status: "pending",
      });

      // Save to database
      const savedMessage = await this.chatMessageRepository.save(chatMessage);

      // Emit event for further processing
      this.eventEmitter.emit("chat.message.received", savedMessage);

      this.logger.log(`Processed chat message: ${savedMessage.id}`);
      return savedMessage;
    } catch (error) {
      this.logger.error(`Error processing chat message: ${error.message}`);
      throw error;
    }
  }

  /**
   * Get chat messages by stream session
   */
  async getChatMessagesByStreamSession(
    streamSessionId: string
  ): Promise<ChatMessage[]> {
    return this.chatMessageRepository.find({
      where: { streamSessionId },
      order: { createdAt: "DESC" },
      take: 100, // Limit to last 100 messages
    });
  }

  /**
   * Update message status
   */
  async updateMessageStatus(
    messageId: string,
    status: string,
    response?: string
  ): Promise<void> {
    await this.chatMessageRepository.update(messageId, {
      status,
      response,
      processedAt: new Date(),
    });
  }

  /**
   * Get message statistics
   */
  async getMessageStatistics(streamSessionId: string): Promise<{
    total: number;
    processed: number;
    filtered: number;
    responded: number;
  }> {
    const [total, processed, filtered, responded] = await Promise.all([
      this.chatMessageRepository.count({ where: { streamSessionId } }),
      this.chatMessageRepository.count({
        where: { streamSessionId, status: "processed" },
      }),
      this.chatMessageRepository.count({
        where: { streamSessionId, status: "filtered" },
      }),
      this.chatMessageRepository.count({
        where: { streamSessionId, status: "responded" },
      }),
    ]);

    return { total, processed, filtered, responded };
  }
}
