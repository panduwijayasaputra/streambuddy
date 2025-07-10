import { Injectable, Logger, Inject } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ResponseTemplate } from "../entities/response-template.entity";
import { Cache } from "cache-manager";
import levenshtein from "fast-levenshtein";

const INDONESIAN_SLANG: Record<string, string[]> = {
  build: ["buld", "bld", "item"],
  hero: ["herro", "hiro", "heronya"],
  counter: ["konter", "lawannya", "musuhnya"],
  meta: ["op", "overpower", "metanya"],
  drop: ["turun", "mendarat", "landing"],
  weapon: ["senjata", "gun", "pistol", "smg", "ar"],
  agent: ["agen", "karakter", "char"],
  tips: ["trik", "cara", "tip"],
  rank: ["tier", "elo", "peringkat"],
};

@Injectable()
export class TemplateResponseService {
  private readonly logger = new Logger(TemplateResponseService.name);

  constructor(
    @InjectRepository(ResponseTemplate)
    private readonly responseTemplateRepository: Repository<ResponseTemplate>,
    @Inject("CACHE_MANAGER") private readonly cacheManager: Cache
  ) {}

  /**
   * Find matching template response with improved matching and caching
   */
  async findTemplateResponse(
    message: string,
    gameContext?: string
  ): Promise<string | null> {
    const cacheKey = `template:${gameContext || "general"}:${message.toLowerCase()}`;
    const cached = await this.cacheManager.get<string>(cacheKey);
    if (cached) {
      this.logger.debug(`Cache hit for template response: ${cacheKey}`);
      return cached;
    }
    try {
      const templates = await this.responseTemplateRepository.find({
        where: { gameContext: gameContext || "general" },
        order: { priority: "DESC" },
      });
      for (const template of templates) {
        if (this.matchesTemplate(message, template)) {
          await this.cacheManager.set(cacheKey, template.response, 300); // 5 min
          return template.response;
        }
      }
      await this.cacheManager.set(cacheKey, null, 60); // Cache miss for 1 min
      return null;
    } catch (error) {
      this.logger.error(`Error finding template response: ${error.message}`);
      return null;
    }
  }

  /**
   * Enhanced template matching: keyword, slang, fuzzy
   */
  private matchesTemplate(
    message: string,
    template: ResponseTemplate
  ): boolean {
    const messageLower = message.toLowerCase();
    const keywords = template.keywords.map((k) => k.toLowerCase());
    // Direct keyword match
    if (keywords.some((keyword) => messageLower.includes(keyword))) return true;
    // Slang/abbreviation match
    for (const keyword of keywords) {
      const slangList = INDONESIAN_SLANG[keyword];
      if (
        slangList &&
        slangList.some((slang) => messageLower.includes(slang))
      ) {
        return true;
      }
    }
    // Fuzzy match (Levenshtein distance <= 2)
    for (const keyword of keywords) {
      const words = messageLower.split(/\s+/);
      if (
        words.some(
          (word) => levenshtein.get(word, keyword) <= 2 && word.length > 3
        )
      ) {
        return true;
      }
    }
    return false;
  }

  /**
   * Get template coverage statistics
   */
  async getTemplateCoverage(): Promise<{
    totalTemplates: number;
    gamesCovered: number;
    averageResponseTime: number;
  }> {
    const [totalTemplates, gamesCovered] = await Promise.all([
      this.responseTemplateRepository.count(),
      this.responseTemplateRepository
        .createQueryBuilder("template")
        .select("COUNT(DISTINCT template.gameContext)", "count")
        .getRawOne(),
    ]);
    return {
      totalTemplates,
      gamesCovered: parseInt(gamesCovered.count),
      averageResponseTime: 0.1, // Placeholder
    };
  }

  /**
   * Validate all templates for quality and required fields
   */
  async validateTemplates(): Promise<{
    valid: boolean;
    errors: string[];
  }> {
    const templates = await this.responseTemplateRepository.find();
    const errors: string[] = [];
    for (const template of templates) {
      if (
        !template.response ||
        !template.keywords ||
        template.keywords.length === 0
      ) {
        errors.push(`Template ${template.id} missing response or keywords`);
      }
      if (!template.gameContext) {
        errors.push(`Template ${template.id} missing gameContext`);
      }
      if (template.keywords.some((k) => k.length < 2)) {
        errors.push(`Template ${template.id} has very short keyword`);
      }
    }
    return { valid: errors.length === 0, errors };
  }
}
