import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { ResponseTemplate } from "../entities/response-template.entity";

@Injectable()
export class TemplateResponseService {
  private readonly logger = new Logger(TemplateResponseService.name);

  constructor(
    @InjectRepository(ResponseTemplate)
    private readonly responseTemplateRepository: Repository<ResponseTemplate>
  ) {}

  /**
   * Find matching template response
   */
  async findTemplateResponse(
    message: string,
    gameContext?: string
  ): Promise<string | null> {
    try {
      const templates = await this.responseTemplateRepository.find({
        where: { gameContext: gameContext || "general" },
        order: { priority: "DESC" },
      });

      for (const template of templates) {
        if (this.matchesTemplate(message, template)) {
          return template.response;
        }
      }

      return null;
    } catch (error) {
      this.logger.error(`Error finding template response: ${error.message}`);
      return null;
    }
  }

  /**
   * Check if message matches template
   */
  private matchesTemplate(
    message: string,
    template: ResponseTemplate
  ): boolean {
    const messageLower = message.toLowerCase();
    const keywords = template.keywords.map((k) => k.toLowerCase());

    return keywords.some((keyword) => messageLower.includes(keyword));
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
}
