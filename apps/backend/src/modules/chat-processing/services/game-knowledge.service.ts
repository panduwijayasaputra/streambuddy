import { Injectable, Logger } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { GameKnowledge } from "../entities/game-knowledge.entity";

@Injectable()
export class GameKnowledgeService {
  private readonly logger = new Logger(GameKnowledgeService.name);

  constructor(
    @InjectRepository(GameKnowledge)
    private readonly gameKnowledgeRepository: Repository<GameKnowledge>
  ) {}

  /**
   * Get game context from message
   */
  async getGameContext(message: string): Promise<string | null> {
    const games = [
      "mobile-legends",
      "free-fire",
      "valorant",
      "pubg",
      "genshin-impact",
      "honkai-star-rail",
      "mlbb",
      "ff",
      "valo",
    ];

    const messageLower = message.toLowerCase();

    for (const game of games) {
      if (messageLower.includes(game)) {
        return game;
      }
    }

    return null;
  }

  /**
   * Get game-specific terminology
   */
  async getGameTerminology(gameContext: string): Promise<string[]> {
    const gameKnowledge = await this.gameKnowledgeRepository.findOne({
      where: { gameContext },
    });

    return gameKnowledge?.terminology || [];
  }

  /**
   * Get build recommendations for a game
   */
  async getBuildRecommendations(
    gameContext: string,
    hero?: string
  ): Promise<string[]> {
    const gameKnowledge = await this.gameKnowledgeRepository.findOne({
      where: { gameContext },
    });

    if (!gameKnowledge) return [];

    if (hero) {
      return gameKnowledge.buildRecommendations[hero] || [];
    }

    return Object.values(gameKnowledge.buildRecommendations).flat() as string[];
  }

  /**
   * Get current meta information
   */
  async getMetaInformation(gameContext: string): Promise<any> {
    const gameKnowledge = await this.gameKnowledgeRepository.findOne({
      where: { gameContext },
    });

    return gameKnowledge?.metaInformation || {};
  }
}
