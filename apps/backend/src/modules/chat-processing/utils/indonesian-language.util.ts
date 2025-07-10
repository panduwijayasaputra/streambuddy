export class IndonesianLanguageUtil {
  /**
   * Check if text contains Indonesian language
   */
  static containsIndonesian(text: string): boolean {
    const indonesianPatterns = [
      /[a-z]+(?:lah|kah|tah|pun|nya)/i,
      /\b(?:yang|dan|atau|dengan|untuk|dari|ke|di|pada|oleh|dari|ke|di|pada|oleh)\b/i,
      /\b(?:saya|aku|kamu|dia|mereka|kami|kita)\b/i,
      /\b(?:ini|itu|sini|sana|mana|apa|siapa|kapan|dimana|bagaimana|kenapa)\b/i,
    ];

    return indonesianPatterns.some((pattern) => pattern.test(text));
  }

  /**
   * Extract Indonesian gaming terms
   */
  static extractIndonesianGamingTerms(text: string): string[] {
    const indonesianGamingTerms = [
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
      "build",
      "counter",
      "tier",
      "op",
      "nerf",
      "buff",
      "jungle",
      "mid",
      "bot",
      "top",
      "support",
      "carry",
      "gank",
      "push",
      "farm",
      "ward",
      "roam",
      "split",
    ];

    const textLower = text.toLowerCase();
    return indonesianGamingTerms.filter((term) => textLower.includes(term));
  }

  /**
   * Normalize Indonesian text for processing
   */
  static normalizeIndonesianText(text: string): string {
    return text
      .toLowerCase()
      .replace(/[^\w\s]/g, " ") // Remove punctuation
      .replace(/\s+/g, " ") // Normalize whitespace
      .trim();
  }

  /**
   * Get language confidence score
   */
  static getLanguageConfidence(text: string): {
    indonesian: number;
    english: number;
  } {
    const indonesianScore = this.containsIndonesian(text) ? 0.8 : 0.2;
    const englishScore = 1 - indonesianScore;

    return {
      indonesian: indonesianScore,
      english: englishScore,
    };
  }
}
