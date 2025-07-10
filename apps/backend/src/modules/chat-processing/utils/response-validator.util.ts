export class ResponseValidatorUtil {
  /**
   * Validate response quality
   */
  static validateResponseQuality(response: string): {
    isValid: boolean;
    score: number;
    issues: string[];
  } {
    const issues: string[] = [];
    let score = 100;

    // Check minimum length
    if (response.length < 10) {
      issues.push("Response too short");
      score -= 30;
    }

    // Check maximum length
    if (response.length > 500) {
      issues.push("Response too long");
      score -= 20;
    }

    // Check for inappropriate content
    if (this.containsInappropriateContent(response)) {
      issues.push("Contains inappropriate content");
      score -= 50;
    }

    // Check for spam indicators
    if (this.containsSpamIndicators(response)) {
      issues.push("Contains spam indicators");
      score -= 40;
    }

    // Check for gaming relevance
    if (!this.isGamingRelevant(response)) {
      issues.push("Not gaming relevant");
      score -= 25;
    }

    return {
      isValid: score >= 70,
      score: Math.max(0, score),
      issues,
    };
  }

  /**
   * Check if response contains inappropriate content
   */
  private static containsInappropriateContent(response: string): boolean {
    const inappropriatePatterns = [
      /(fuck|shit|bitch|asshole)/i,
      /(anjing|bangsat|goblok|tolol)/i,
    ];

    return inappropriatePatterns.some((pattern) => pattern.test(response));
  }

  /**
   * Check if response contains spam indicators
   */
  private static containsSpamIndicators(response: string): boolean {
    const spamPatterns = [
      /(buy|sell|click|free|money|earn|profit)/i,
      /(http|www\.)/i,
      /(.)\1{4,}/, // Repeated characters
    ];

    return spamPatterns.some((pattern) => pattern.test(response));
  }

  /**
   * Check if response is gaming relevant
   */
  private static isGamingRelevant(response: string): boolean {
    const gamingKeywords = [
      "game",
      "hero",
      "champion",
      "item",
      "skill",
      "build",
      "strategy",
      "meta",
      "team",
      "match",
      "play",
      "permainan",
      "hero",
      "item",
      "skill",
      "build",
      "strategi",
      "meta",
      "tim",
      "pertandingan",
    ];

    const responseLower = response.toLowerCase();
    return gamingKeywords.some((keyword) => responseLower.includes(keyword));
  }

  /**
   * Get response confidence score
   */
  static getResponseConfidence(response: string): number {
    const validation = this.validateResponseQuality(response);
    return validation.score / 100;
  }
}
