import { Injectable, Logger } from "@nestjs/common";

@Injectable()
export class ContentFilterService {
  private readonly logger = new Logger(ContentFilterService.name);

  // Enhanced spam patterns
  private readonly spamPatterns = [
    /(.)\1{4,}/, // Repeated characters (5+)
    /[A-Z]{10,}/, // ALL CAPS (10+ characters)
    /(http|www\.|bit\.ly|tinyurl)/i, // URLs and shorteners
    /(buy|sell|click|free|money|earn|profit|income|cash|dollar|dollars)/i, // Spam keywords
    /(follow|subscribe|like|share|retweet|dm|pm)/i, // Social media spam
    /(discord|telegram|whatsapp|line|kik)/i, // External communication
    /(hack|cheat|mod|bot|script|tool)/i, // Gaming-related spam
    /(nude|sex|porn|adult|xxx)/i, // Adult content spam
    /(viagra|cialis|penis|dick|pussy)/i, // Adult product spam
    /(loan|credit|debt|mortgage|insurance)/i, // Financial spam
    /(weight|diet|fat|slim|lose)/i, // Health spam
    /(lottery|casino|bet|gambling|poker)/i, // Gambling spam
    /(virus|malware|antivirus|clean)/i, // Tech spam
    /(offer|deal|discount|sale|limited)/i, // Marketing spam
  ];

  // Enhanced inappropriate patterns (English)
  private readonly inappropriateEnglish = [
    /(fuck|shit|bitch|asshole|dick|pussy|cunt|whore|slut)/i,
    /(damn|hell|goddamn|jesus|christ)/i,
    /(kill|die|death|suicide|murder)/i,
    /(hate|racist|nazi|hitler)/i,
    /(stupid|idiot|moron|retard|dumb)/i,
    /(fat|ugly|gay|lesbian|queer)/i,
  ];

  // Enhanced inappropriate patterns (Indonesian)
  private readonly inappropriateIndonesian = [
    /(anjing|bangsat|goblok|tolol|bego|bodoh)/i,
    /(kontol|memek|pantek|jancok|jancuk)/i,
    /(babi|bajingan|bangsat|anjir|anjrit)/i,
    /(sial|celaka|kurang|ajar|dasar)/i,
    /(mati|mampus|tewas|binasa)/i,
    /(bodoh|tolol|goblok|bego|idiot)/i,
    /(jelek|buruk|hina|rendah)/i,
  ];

  // Gaming-specific toxic patterns
  private readonly gamingToxicPatterns = [
    /(noob|nub|newb|newbie)/i,
    /(uninstall|delete|quit|leave)/i,
    /(trash|garbage|useless|worthless)/i,
    /(carry|carried|boost|smurf)/i,
    /(report|reported|ban|banned)/i,
    /(ez|easy|free|win)/i,
    /(bad game)/i, // Only flag "bad game", not "good game"
    /(team|teammate|ally|enemy)/i,
  ];

  // Gaming keywords for context detection
  private readonly gamingKeywords = [
    // English gaming terms
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
    "damage",
    "heal",
    "tank",
    "support",
    "carry",
    "jungle",
    "lane",
    "mid",
    "top",
    "bottom",
    "adc",
    "apc",
    "mage",
    "assassin",
    "fighter",
    "marksman",
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
    "kerusakan",
    "penyembuhan",
    "tank",
    "support",
    "carry",
    "hutan",
    "jalur",
    "tengah",
    "atas",
    "bawah",
    "penyihir",
    "pembunuh",
    "petarung",
    "penembak",
  ];

  /**
   * Check if message is spam with enhanced detection
   */
  async isSpam(message: string, username: string): Promise<boolean> {
    const messageLower = message.toLowerCase();

    // Check for spam patterns
    const hasSpamPattern = this.spamPatterns.some((pattern) =>
      pattern.test(message)
    );

    // Check for excessive repetition
    const words = messageLower.split(/\s+/);
    const uniqueWords = new Set(words);
    const repetitionRatio = uniqueWords.size / words.length;
    const hasExcessiveRepetition = repetitionRatio < 0.3 && words.length > 5;

    // Check for suspicious username patterns
    const suspiciousUsername = /(bot|spam|ad|promo|sell|buy)/i.test(username);

    // Check for common gaming expressions that should be allowed even if short
    const commonGamingExpressions = [
      "gg",
      "wp",
      "gl",
      "hf",
      "gg!",
      "wp!",
      "gl!",
      "hf!",
    ];
    const isCommonGamingExpression = commonGamingExpressions.includes(
      message.toLowerCase()
    );

    // Check for message length (too short or too long)
    const isTooShort = message.length < 3 && !isCommonGamingExpression; // Allow "gg" and similar short gaming expressions
    const isTooLong = message.length > 500;

    const isSpam =
      hasSpamPattern ||
      hasExcessiveRepetition ||
      suspiciousUsername ||
      isTooShort ||
      isTooLong;

    if (isSpam) {
      this.logger.debug(`Spam detected for user ${username}: "${message}"`);
    }

    return isSpam;
  }

  /**
   * Check if message is inappropriate with enhanced detection
   */
  async isInappropriate(message: string): Promise<boolean> {
    const messageLower = message.toLowerCase();

    // Check English inappropriate patterns
    const hasEnglishInappropriate = this.inappropriateEnglish.some((pattern) =>
      pattern.test(message)
    );

    // Check Indonesian inappropriate patterns
    const hasIndonesianInappropriate = this.inappropriateIndonesian.some(
      (pattern) => pattern.test(message)
    );

    // Check for gaming-specific toxic patterns
    const hasGamingToxic = this.gamingToxicPatterns.some((pattern) =>
      pattern.test(message)
    );

    // Check for obfuscated profanity (using numbers/symbols)
    const obfuscatedPatterns = [
      /f[u*]ck/i,
      /sh[i*]t/i,
      /b[i*]tch/i,
      /d[i*]ck/i,
      /a[n*]jing/i,
      /b[a*]ngsat/i,
      /g[o*]blok/i,
    ];
    const hasObfuscated = obfuscatedPatterns.some((pattern) =>
      pattern.test(message)
    );

    const isInappropriate =
      hasEnglishInappropriate ||
      hasIndonesianInappropriate ||
      hasGamingToxic ||
      hasObfuscated;

    if (isInappropriate) {
      this.logger.debug(`Inappropriate content detected: "${message}"`);
    }

    return isInappropriate;
  }

  /**
   * Check if message is gaming-related with enhanced detection
   */
  async isGamingRelated(message: string): Promise<boolean> {
    const messageLower = message.toLowerCase();

    // Check for gaming keywords
    const hasGamingKeywords = this.gamingKeywords.some((keyword) =>
      messageLower.includes(keyword.toLowerCase())
    );

    // Check for game-specific terms
    const gameSpecificTerms = [
      "mobile legends",
      "ml",
      "free fire",
      "ff",
      "valorant",
      "lol",
      "league of legends",
      "dota",
      "csgo",
      "counter strike",
      "pubg",
      "fortnite",
      "apex",
      "overwatch",
      "mobile legends",
      "ml",
      "free fire",
      "ff",
      "valorant",
      "lol",
      "league of legends",
    ];
    const hasGameSpecific = gameSpecificTerms.some((term) =>
      messageLower.includes(term.toLowerCase())
    );

    return hasGamingKeywords || hasGameSpecific;
  }

  /**
   * Get message priority score with enhanced logic
   */
  async getMessagePriority(message: string, username: string): Promise<number> {
    let priority = 1;

    // Higher priority for gaming-related messages
    if (await this.isGamingRelated(message)) {
      priority += 3;
    }

    // Lower priority for spam
    if (await this.isSpam(message, username)) {
      priority -= 5;
    }

    // Lower priority for inappropriate content
    if (await this.isInappropriate(message)) {
      priority -= 8;
    }

    // Bonus for questions
    if (
      message.includes("?") ||
      message.includes("bagaimana") ||
      message.includes("apa") ||
      message.includes("kenapa")
    ) {
      priority += 2;
    }

    // Bonus for longer, more thoughtful messages
    if (message.length > 20 && message.length < 200) {
      priority += 1;
    }

    // Penalty for very short messages (but allow common gaming expressions)
    if (
      message.length < 4 &&
      !["gg", "wp", "gl", "hf"].includes(message.toLowerCase())
    ) {
      priority -= 1;
    }

    return Math.max(0, Math.min(10, priority)); // Clamp between 0-10
  }

  /**
   * Filter message based on content with enhanced logic
   */
  async filterMessage(
    message: string,
    username: string
  ): Promise<{
    shouldProcess: boolean;
    reason: string;
    priority: number;
    details: {
      isSpam: boolean;
      isInappropriate: boolean;
      isGamingRelated: boolean;
      messageLength: number;
      wordCount: number;
    };
  }> {
    const isSpam = await this.isSpam(message, username);
    const isInappropriate = await this.isInappropriate(message);
    const isGamingRelated = await this.isGamingRelated(message);
    const priority = await this.getMessagePriority(message, username);

    const details = {
      isSpam,
      isInappropriate,
      isGamingRelated,
      messageLength: message.length,
      wordCount: message.split(/\s+/).length,
    };

    // Log filtering decision
    this.logger.debug(`Filtering message from ${username}: "${message}"`, {
      isSpam,
      isInappropriate,
      isGamingRelated,
      priority,
      reason: isSpam ? "spam" : isInappropriate ? "inappropriate" : "valid",
    });

    if (isSpam) {
      return {
        shouldProcess: false,
        reason: "spam",
        priority: 0,
        details,
      };
    }

    if (isInappropriate) {
      return {
        shouldProcess: false,
        reason: "inappropriate",
        priority: 0,
        details,
      };
    }

    return {
      shouldProcess: true,
      reason: "valid",
      priority,
      details,
    };
  }

  /**
   * Get filter statistics for a stream session
   */
  async getFilterStatistics(
    messages: Array<{ message: string; username: string; metadata?: any }>
  ): Promise<{
    total: number;
    filtered: number;
    spam: number;
    inappropriate: number;
    gamingRelated: number;
    averagePriority: number;
  }> {
    let filtered = 0;
    let spam = 0;
    let inappropriate = 0;
    let gamingRelated = 0;
    let totalPriority = 0;

    for (const msg of messages) {
      const filterResult = await this.filterMessage(msg.message, msg.username);

      if (!filterResult.shouldProcess) {
        filtered++;
        if (filterResult.reason === "spam") spam++;
        if (filterResult.reason === "inappropriate") inappropriate++;
      }

      if (filterResult.details.isGamingRelated) {
        gamingRelated++;
      }

      totalPriority += filterResult.priority;
    }

    return {
      total: messages.length,
      filtered,
      spam,
      inappropriate,
      gamingRelated,
      averagePriority:
        messages.length > 0 ? totalPriority / messages.length : 0,
    };
  }
}
