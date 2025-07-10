import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class ContentFilterService {
  private readonly logger = new Logger(ContentFilterService.name);

  /**
   * Check if message is spam
   */
  async isSpam(message: string, username: string): Promise<boolean> {
    // Basic spam detection logic
    const spamIndicators = [
      /(.)\1{4,}/, // Repeated characters
      /[A-Z]{10,}/, // ALL CAPS
      /(http|www\.)/i, // URLs
      /(buy|sell|click|free|money)/i, // Spam keywords
    ];

    return spamIndicators.some((pattern) => pattern.test(message));
  }

  /**
   * Check if message is inappropriate
   */
  async isInappropriate(message: string): Promise<boolean> {
    // Basic inappropriate content detection
    const inappropriatePatterns = [
      /(fuck|shit|bitch|asshole)/i,
      /(anjing|bangsat|goblok|tolol)/i, // Indonesian profanity
    ];

    return inappropriatePatterns.some((pattern) => pattern.test(message));
  }

  /**
   * Check if message is gaming-related
   */
  async isGamingRelated(message: string): Promise<boolean> {
    const gamingKeywords = [
      "build",
      "hero",
      "champion",
      "item",
      "skill",
      "ultimate",
      "team",
      "match",
      "game",
      "play",
      "strategy",
      "meta",
      "rank",
      "league",
      "tournament",
      "esports",
      // Indonesian gaming terms
      "hero",
      "item",
      "skill",
      "ultimate",
      "tim",
      "pertandingan",
      "permainan",
      "strategi",
      "meta",
      "peringkat",
      "liga",
    ];

    const messageLower = message.toLowerCase();
    return gamingKeywords.some((keyword) => messageLower.includes(keyword));
  }

  /**
   * Get message priority score
   */
  async getMessagePriority(message: string, username: string): Promise<number> {
    let priority = 1;

    // Higher priority for gaming-related messages
    if (await this.isGamingRelated(message)) {
      priority += 2;
    }

    // Lower priority for spam
    if (await this.isSpam(message, username)) {
      priority -= 3;
    }

    // Lower priority for inappropriate content
    if (await this.isInappropriate(message)) {
      priority -= 5;
    }

    return Math.max(0, priority);
  }

  /**
   * Filter message based on content
   */
  async filterMessage(
    message: string,
    username: string
  ): Promise<{
    shouldProcess: boolean;
    reason: string;
    priority: number;
  }> {
    const isSpam = await this.isSpam(message, username);
    const isInappropriate = await this.isInappropriate(message);
    const priority = await this.getMessagePriority(message, username);

    if (isSpam) {
      return {
        shouldProcess: false,
        reason: "spam",
        priority: 0,
      };
    }

    if (isInappropriate) {
      return {
        shouldProcess: false,
        reason: "inappropriate",
        priority: 0,
      };
    }

    return {
      shouldProcess: true,
      reason: "valid",
      priority,
    };
  }
}
