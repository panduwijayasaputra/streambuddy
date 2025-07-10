import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class AiResponseService {
  private readonly logger = new Logger(AiResponseService.name);

  constructor(private readonly configService: ConfigService) {}

  /**
   * Generate AI response using OpenAI
   */
  async generateResponse(
    message: string,
    gameContext?: string
  ): Promise<string> {
    try {
      // TODO: Implement OpenAI API integration
      this.logger.log(`Generating AI response for message: ${message}`);

      // Placeholder response for now
      return `AI response for: ${message}`;
    } catch (error) {
      this.logger.error(`Error generating AI response: ${error.message}`);
      throw error;
    }
  }

  /**
   * Check if message requires AI response
   */
  async requiresAiResponse(message: string): Promise<boolean> {
    // Complex questions that need AI processing
    const complexPatterns = [
      /how to/i,
      /what is/i,
      /why does/i,
      /when should/i,
      /which is better/i,
      /bagaimana cara/i, // Indonesian
      /apa itu/i,
      /kenapa/i,
      /kapan/i,
      /mana yang lebih/i,
    ];

    return complexPatterns.some((pattern) => pattern.test(message));
  }

  /**
   * Get response cost estimate
   */
  async getResponseCost(message: string): Promise<number> {
    // Estimate cost based on message length
    const tokenCount = Math.ceil(message.length / 4); // Rough estimate
    const costPerToken = 0.0001; // Example cost
    return tokenCount * costPerToken;
  }
}
