import { DataSource } from "typeorm";
import { ResponseTemplate } from "../entities/response-template.entity";

export const responseTemplatesSeed = async (
  dataSource: DataSource
): Promise<void> => {
  const responseTemplateRepository = dataSource.getRepository(ResponseTemplate);

  const templates = [
    // Mobile Legends templates
    {
      gameContext: "mobile-legends",
      keywords: ["build", "item", "hero"],
      response:
        "Untuk build yang optimal, fokus pada item yang sesuai dengan role hero. Jangan lupa adaptasi berdasarkan situasi pertandingan!",
      priority: 5,
      metadata: {
        language: "id",
        category: "build",
        difficulty: "beginner",
      },
    },
    {
      gameContext: "mobile-legends",
      keywords: ["counter", "lawan", "musuh"],
      response:
        "Untuk counter yang efektif, pilih hero yang memiliki keunggulan terhadap musuh. Perhatikan timing dan positioning!",
      priority: 4,
      metadata: {
        language: "id",
        category: "strategy",
        difficulty: "intermediate",
      },
    },
    {
      gameContext: "mobile-legends",
      keywords: ["meta", "tier", "op"],
      response:
        "Meta saat ini didominasi oleh hero-hero yang memiliki crowd control dan burst damage. Selalu update pengetahuan meta!",
      priority: 3,
      metadata: {
        language: "id",
        category: "meta",
        difficulty: "advanced",
      },
    },

    // Free Fire templates
    {
      gameContext: "free-fire",
      keywords: ["drop", "landing", "spawn"],
      response:
        "Pilih drop location yang strategis dan dekat dengan safe zone. Jangan lupa loot dengan cepat dan efisien!",
      priority: 5,
      metadata: {
        language: "id",
        category: "strategy",
        difficulty: "beginner",
      },
    },
    {
      gameContext: "free-fire",
      keywords: ["weapon", "gun", "senjata"],
      response:
        "Pilih senjata sesuai dengan situasi. SMG untuk close combat, AR untuk mid-range, dan sniper untuk long-range!",
      priority: 4,
      metadata: {
        language: "id",
        category: "weapon",
        difficulty: "intermediate",
      },
    },

    // Valorant templates
    {
      gameContext: "valorant",
      keywords: ["agent", "character", "hero"],
      response:
        "Pilih agent yang sesuai dengan playstyle tim. Duelist untuk entry, Controller untuk utility, dan Sentinel untuk defense!",
      priority: 5,
      metadata: {
        language: "id",
        category: "agent",
        difficulty: "beginner",
      },
    },
    {
      gameContext: "valorant",
      keywords: ["lineup", "ability", "skill"],
      response:
        "Pelajari lineup ability yang efektif untuk setiap map. Timing dan positioning sangat penting untuk utility usage!",
      priority: 4,
      metadata: {
        language: "id",
        category: "ability",
        difficulty: "intermediate",
      },
    },

    // General gaming templates
    {
      gameContext: "general",
      keywords: ["tips", "trick", "cara"],
      response:
        "Tips gaming: selalu komunikasi dengan tim, fokus pada objective, dan jangan toxic! Practice makes perfect!",
      priority: 2,
      metadata: {
        language: "id",
        category: "general",
        difficulty: "beginner",
      },
    },
    {
      gameContext: "general",
      keywords: ["rank", "tier", "elo"],
      response:
        "Untuk naik rank, fokus pada improvement skill dan teamwork. Jangan terlalu fokus pada win/loss ratio!",
      priority: 3,
      metadata: {
        language: "id",
        category: "rank",
        difficulty: "intermediate",
      },
    },
  ];

  for (const template of templates) {
    const existingTemplate = await responseTemplateRepository.findOne({
      where: {
        gameContext: template.gameContext,
      },
    });

    if (!existingTemplate) {
      await responseTemplateRepository.save(template);
    }
  }
};
