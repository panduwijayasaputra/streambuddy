import { DataSource } from "typeorm";
import { GameKnowledge } from "../entities/game-knowledge.entity";

export const gameKnowledgeSeed = async (
  dataSource: DataSource
): Promise<void> => {
  const gameKnowledgeRepository = dataSource.getRepository(GameKnowledge);

  const gameKnowledge = [
    // Mobile Legends
    {
      gameContext: "mobile-legends",
      terminology: [
        "hero",
        "item",
        "skill",
        "ultimate",
        "jungle",
        "mid",
        "bot",
        "top",
        "gank",
        "push",
        "farm",
        "ward",
        "roam",
        "split",
        "teamfight",
        "objective",
        "turtle",
        "lord",
        "tower",
        "base",
        "minion",
        "hero",
        "item",
        "skill",
        "ultimate",
        "hutan",
        "tengah",
        "bawah",
        "atas",
        "gank",
        "push",
        "farm",
        "ward",
        "roam",
        "split",
        "teamfight",
        "objective",
        "kura-kura",
        "lord",
        "menara",
        "base",
        "minion",
      ],
      buildRecommendations: {
        marksman: [
          "Swift Boots - Demon Shoes - Wind of Nature - Blade of Despair - Malefic Roar - Immortality",
          "Swift Boots - Demon Shoes - Wind of Nature - Blade of Despair - Malefic Roar - Blood Wings",
        ],
        mage: [
          "Arcane Boots - Lightning Truncheon - Holy Crystal - Divine Glaive - Blood Wings - Immortality",
          "Arcane Boots - Lightning Truncheon - Holy Crystal - Divine Glaive - Blood Wings - Winter Truncheon",
        ],
        tank: [
          "Warrior Boots - Blade Armor - Antique Cuirass - Athena's Shield - Immortality - Guardian Helmet",
          "Warrior Boots - Blade Armor - Antique Cuirass - Athena's Shield - Immortality - Brute Force Breastplate",
        ],
      },
      metaInformation: {
        currentMeta:
          "Fast-paced meta with emphasis on early game objectives and team coordination",
        tierList: {
          "S-Tier": "Lunox, Harith, Granger, Claude, Khufra",
          "A-Tier": "Esmeralda, X.Borg, Lylia, Chang'e, Angela",
          "B-Tier": "Grock, Tigreal, Franco, Johnson, Minotaur",
        },
        counters: {
          Lunox: ["Khufra", "Grock", "Franco"],
          Harith: ["Khufra", "Grock", "Franco"],
          Granger: ["Khufra", "Grock", "Franco"],
        },
        strategies: [
          "Early game aggression with jungle control",
          "Mid game objective focus with team coordination",
          "Late game teamfight execution with proper positioning",
        ],
      },
    },

    // Free Fire
    {
      gameContext: "free-fire",
      terminology: [
        "drop",
        "landing",
        "spawn",
        "loot",
        "safe zone",
        "blue zone",
        "weapon",
        "gun",
        "armor",
        "helmet",
        "vest",
        "backpack",
        "squad",
        "duo",
        "solo",
        "rank",
        "elite",
        "grandmaster",
        "drop",
        "landing",
        "spawn",
        "loot",
        "safe zone",
        "blue zone",
        "senjata",
        "peluru",
        "armor",
        "helmet",
        "vest",
        "backpack",
        "squad",
        "duo",
        "solo",
        "rank",
        "elite",
        "grandmaster",
      ],
      buildRecommendations: {
        assault: [
          "M4A1 + AWM + M1014 + Smoke Grenade + Frag Grenade + Medkit",
          "AK47 + AWM + M1014 + Smoke Grenade + Frag Grenade + Medkit",
        ],
        sniper: [
          "AWM + M4A1 + M1014 + Smoke Grenade + Frag Grenade + Medkit",
          "AWM + AK47 + M1014 + Smoke Grenade + Frag Grenade + Medkit",
        ],
        support: [
          "M4A1 + M1014 + Smoke Grenade + Frag Grenade + Medkit + Bandage",
          "AK47 + M1014 + Smoke Grenade + Frag Grenade + Medkit + Bandage",
        ],
      },
      metaInformation: {
        currentMeta:
          "Aggressive meta with emphasis on early game positioning and weapon mastery",
        tierList: {
          "S-Tier": "AWM, M4A1, AK47, M1014",
          "A-Tier": "SCAR-L, G36C, MP40, UMP",
          "B-Tier": "M16A4, FAMAS, P90, UZI",
        },
        counters: {
          AWM: ["Smoke Grenade", "Cover", "Movement"],
          M4A1: ["AK47", "SCAR-L", "Positioning"],
          AK47: ["M4A1", "SCAR-L", "Recoil Control"],
        },
        strategies: [
          "Early game aggressive positioning and loot collection",
          "Mid game safe zone management and team coordination",
          "Late game positioning and weapon mastery execution",
        ],
      },
    },

    // Valorant
    {
      gameContext: "valorant",
      terminology: [
        "agent",
        "character",
        "hero",
        "ability",
        "skill",
        "ultimate",
        "duelist",
        "controller",
        "sentinel",
        "initiator",
        "entry",
        "support",
        "lineup",
        "positioning",
        "crosshair",
        "spray",
        "tap",
        "burst",
        "agent",
        "character",
        "hero",
        "ability",
        "skill",
        "ultimate",
        "duelist",
        "controller",
        "sentinel",
        "initiator",
        "entry",
        "support",
        "lineup",
        "positioning",
        "crosshair",
        "spray",
        "tap",
        "burst",
      ],
      buildRecommendations: {
        duelist: [
          "Vandal + Phantom + Operator + Classic + Utility",
          "Vandal + Phantom + Operator + Classic + Utility",
        ],
        controller: [
          "Vandal + Phantom + Operator + Classic + Utility",
          "Vandal + Phantom + Operator + Classic + Utility",
        ],
        sentinel: [
          "Vandal + Phantom + Operator + Classic + Utility",
          "Vandal + Phantom + Operator + Classic + Utility",
        ],
      },
      metaInformation: {
        currentMeta:
          "Utility-focused meta with emphasis on team coordination and ability usage",
        tierList: {
          "S-Tier": "Jett, Reyna, Chamber, Killjoy, Sova",
          "A-Tier": "Phoenix, Raze, Cypher, Viper, Omen",
          "B-Tier": "Yoru, Skye, Astra, Breach, Sage",
        },
        counters: {
          Jett: ["Sova", "Cypher", "Killjoy"],
          Reyna: ["Sova", "Cypher", "Killjoy"],
          Chamber: ["Sova", "Cypher", "Killjoy"],
        },
        strategies: [
          "Early game utility usage and information gathering",
          "Mid game ability coordination and team execution",
          "Late game clutch situations and individual skill",
        ],
      },
    },
  ];

  for (const knowledge of gameKnowledge) {
    const existingKnowledge = await gameKnowledgeRepository.findOne({
      where: {
        gameContext: knowledge.gameContext,
      },
    });

    if (!existingKnowledge) {
      await gameKnowledgeRepository.save(knowledge);
    }
  }
};
