import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository, In } from "typeorm";
import { EventEmitter2 } from "@nestjs/event-emitter";
import { ChatMessage } from "../entities/chat-message.entity";
import { CreateChatMessageDto } from "../dto/chat-message.dto";
import { ContentFilterService } from "./content-filter.service";
import { GameKnowledgeService } from "./game-knowledge.service";

@Injectable()
export class ChatMessageService {
  private readonly logger = new Logger(ChatMessageService.name);

  constructor(
    @InjectRepository(ChatMessage)
    private readonly chatMessageRepository: Repository<ChatMessage>,
    private readonly eventEmitter: EventEmitter2,
    private readonly contentFilterService: ContentFilterService,
    private readonly gameKnowledgeService: GameKnowledgeService
  ) {}

  /**
   * Process incoming chat message with enhanced ingestion
   */
  async processChatMessage(
    createChatMessageDto: CreateChatMessageDto
  ): Promise<ChatMessage> {
    try {
      // Get game context and filter message
      const gameContext = await this.gameKnowledgeService.getGameContext(
        createChatMessageDto.message
      );
      const filterResult = await this.contentFilterService.filterMessage(
        createChatMessageDto.message,
        createChatMessageDto.username
      );

      // Create chat message entity with metadata
      const chatMessage = this.chatMessageRepository.create({
        ...createChatMessageDto,
        processedAt: new Date(),
        status: filterResult.shouldProcess ? "pending" : "filtered",
        metadata: {
          gameContext,
          priority: filterResult.priority,
          isSpam: filterResult.reason === "spam",
          isInappropriate: filterResult.reason === "inappropriate",
          language: await this.detectLanguage(createChatMessageDto.message),
          confidence: filterResult.priority / 10, // Normalize priority to 0-1
        },
      });

      // Save to database
      const savedMessage = await this.chatMessageRepository.save(chatMessage);

      // Emit event for further processing
      this.eventEmitter.emit("chat.message.received", savedMessage);

      this.logger.log(
        `Processed chat message: ${savedMessage.id} from ${createChatMessageDto.username}`
      );
      return savedMessage;
    } catch (error) {
      this.logger.error(`Error processing chat message: ${error.message}`);
      throw error;
    }
  }

  /**
   * Detect language of the message
   */
  private async detectLanguage(message: string): Promise<string> {
    // Simple language detection based on Indonesian patterns
    const indonesianPatterns = [
      /\b(?:yang|dan|atau|dengan|untuk|dari|ke|di|pada|oleh)\b/i,
      /\b(?:saya|aku|kamu|dia|mereka|kami|kita)\b/i,
      /\b(?:ini|itu|sini|sana|mana|apa|siapa|kapan|dimana|bagaimana|kenapa)\b/i,
    ];

    const hasIndonesianPatterns = indonesianPatterns.some((pattern) =>
      pattern.test(message)
    );

    return hasIndonesianPatterns ? "id" : "en";
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
    status: "pending" | "processed" | "filtered" | "responded" | "error",
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

  /**
   * Get messages by status
   */
  async getMessagesByStatus(
    streamSessionId: string,
    status: "pending" | "processed" | "filtered" | "responded" | "error",
    limit: number = 50
  ): Promise<ChatMessage[]> {
    return this.chatMessageRepository.find({
      where: { streamSessionId, status },
      order: { createdAt: "DESC" },
      take: limit,
    });
  }

  /**
   * Get messages by game context
   */
  async getMessagesByGameContext(
    streamSessionId: string,
    gameContext: string,
    limit: number = 50
  ): Promise<ChatMessage[]> {
    return this.chatMessageRepository
      .createQueryBuilder("message")
      .where("message.streamSessionId = :streamSessionId", { streamSessionId })
      .andWhere("message.metadata->>'gameContext' = :gameContext", {
        gameContext,
      })
      .orderBy("message.createdAt", "DESC")
      .take(limit)
      .getMany();
  }

  /**
   * Get messages by user
   */
  async getMessagesByUser(
    streamSessionId: string,
    userId: string,
    limit: number = 50
  ): Promise<ChatMessage[]> {
    return this.chatMessageRepository.find({
      where: { streamSessionId, userId },
      order: { createdAt: "DESC" },
      take: limit,
    });
  }

  /**
   * Get recent messages for real-time display
   */
  async getRecentMessages(
    streamSessionId: string,
    limit: number = 20
  ): Promise<ChatMessage[]> {
    return this.chatMessageRepository.find({
      where: { streamSessionId },
      order: { createdAt: "DESC" },
      take: limit,
      relations: [], // No relations needed for performance
    });
  }

  /**
   * Get message analytics
   */
  async getMessageAnalytics(streamSessionId: string): Promise<{
    totalMessages: number;
    uniqueUsers: number;
    averageResponseTime: number;
    topGameContexts: Array<{ gameContext: string; count: number }>;
    languageDistribution: Array<{ language: string; count: number }>;
  }> {
    const totalMessages = await this.chatMessageRepository.count({
      where: { streamSessionId },
    });

    const uniqueUsers = await this.chatMessageRepository
      .createQueryBuilder("message")
      .select("COUNT(DISTINCT message.userId)", "count")
      .where("message.streamSessionId = :streamSessionId", { streamSessionId })
      .getRawOne();

    const topGameContexts = await this.chatMessageRepository
      .createQueryBuilder("message")
      .select("message.metadata->>'gameContext'", "gameContext")
      .addSelect("COUNT(*)", "count")
      .where("message.streamSessionId = :streamSessionId", { streamSessionId })
      .andWhere("message.metadata->>'gameContext' IS NOT NULL")
      .groupBy("message.metadata->>'gameContext'")
      .orderBy("count", "DESC")
      .limit(5)
      .getRawMany();

    const languageDistribution = await this.chatMessageRepository
      .createQueryBuilder("message")
      .select("message.metadata->>'language'", "language")
      .addSelect("COUNT(*)", "count")
      .where("message.streamSessionId = :streamSessionId", { streamSessionId })
      .andWhere("message.metadata->>'language' IS NOT NULL")
      .groupBy("message.metadata->>'language'")
      .orderBy("count", "DESC")
      .getRawMany();

    return {
      totalMessages,
      uniqueUsers: parseInt(uniqueUsers.count),
      averageResponseTime: 0, // TODO: Calculate from processedAt - createdAt
      topGameContexts: topGameContexts.map((item) => ({
        gameContext: item.gameContext,
        count: parseInt(item.count),
      })),
      languageDistribution: languageDistribution.map((item) => ({
        language: item.language,
        count: parseInt(item.count),
      })),
    };
  }

  /**
   * Bulk insert messages for high-volume ingestion
   */
  async bulkInsertMessages(
    messages: CreateChatMessageDto[]
  ): Promise<ChatMessage[]> {
    try {
      const processedMessages = await Promise.all(
        messages.map(async (messageDto) => {
          const gameContext = await this.gameKnowledgeService.getGameContext(
            messageDto.message
          );
          const filterResult = await this.contentFilterService.filterMessage(
            messageDto.message,
            messageDto.username
          );

          return this.chatMessageRepository.create({
            ...messageDto,
            processedAt: new Date(),
            status: filterResult.shouldProcess ? "pending" : "filtered",
            metadata: {
              gameContext,
              priority: filterResult.priority,
              isSpam: filterResult.reason === "spam",
              isInappropriate: filterResult.reason === "inappropriate",
              language: await this.detectLanguage(messageDto.message),
              confidence: filterResult.priority / 10,
            },
          });
        })
      );

      const savedMessages =
        await this.chatMessageRepository.save(processedMessages);

      // Emit events for each message
      savedMessages.forEach((message) => {
        this.eventEmitter.emit("chat.message.received", message);
      });

      this.logger.log(`Bulk inserted ${savedMessages.length} messages`);
      return savedMessages;
    } catch (error) {
      this.logger.error(`Error bulk inserting messages: ${error.message}`);
      throw error;
    }
  }
}
