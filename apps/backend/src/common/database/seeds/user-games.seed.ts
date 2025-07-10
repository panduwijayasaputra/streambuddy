import { DataSource } from "typeorm";
import { UserGame, UserGameStatus } from "../entities/user-game.entity";
import { User } from "../entities/user.entity";
import { Game } from "../entities/game.entity";

export class UserGamesSeed {
  constructor(private dataSource: DataSource) {}

  async run(): Promise<void> {
    const userGameRepository = this.dataSource.getRepository(UserGame);
    const userRepository = this.dataSource.getRepository(User);
    const gameRepository = this.dataSource.getRepository(Game);

    // Get all users and games
    const users = await userRepository.find();
    const games = await gameRepository.find();

    // Create a mapping of usernames to user IDs
    const userMap = new Map(users.map((user) => [user.username, user.id]));
    const gameMap = new Map(games.map((game) => [game.slug, game.id]));

    const userGameRelationships = [
      // Mobile Legends players
      {
        username: "budi_gamer",
        gameSlug: "mobile-legends",
        status: UserGameStatus.FAVORITE,
        playTime: 1200, // 20 hours
        lastPlayedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        preferences: {
          chatEnabled: true,
          voiceEnabled: true,
          videoEnabled: false,
          notifications: true,
          autoJoin: true,
        },
        stats: {
          totalSessions: 150,
          totalMessages: 2500,
          totalVoiceTime: 45,
          totalVideoTime: 0,
          favoritePartners: ["sari_queen", "lina_moba"],
        },
      },
      {
        username: "lina_moba",
        gameSlug: "mobile-legends",
        status: UserGameStatus.FAVORITE,
        playTime: 1800, // 30 hours
        lastPlayedAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        preferences: {
          chatEnabled: true,
          voiceEnabled: true,
          videoEnabled: false,
          notifications: true,
          autoJoin: true,
        },
        stats: {
          totalSessions: 200,
          totalMessages: 3000,
          totalVoiceTime: 60,
          totalVideoTime: 0,
          favoritePartners: ["budi_gamer", "sari_queen"],
        },
      },

      // PUBG Mobile players
      {
        username: "sari_queen",
        gameSlug: "pubg-mobile",
        status: UserGameStatus.FAVORITE,
        playTime: 2400, // 40 hours
        lastPlayedAt: new Date(Date.now() - 30 * 60 * 1000), // 30 minutes ago
        preferences: {
          chatEnabled: true,
          voiceEnabled: true,
          videoEnabled: false,
          notifications: true,
          autoJoin: true,
        },
        stats: {
          totalSessions: 300,
          totalMessages: 5000,
          totalVoiceTime: 90,
          totalVideoTime: 0,
          favoritePartners: ["andi_fps", "heru_battle_royale"],
        },
      },
      {
        username: "andi_fps",
        gameSlug: "pubg-mobile",
        status: UserGameStatus.ACTIVE,
        playTime: 1500, // 25 hours
        lastPlayedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        preferences: {
          chatEnabled: true,
          voiceEnabled: true,
          videoEnabled: false,
          notifications: true,
          autoJoin: false,
        },
        stats: {
          totalSessions: 180,
          totalMessages: 2800,
          totalVoiceTime: 55,
          totalVideoTime: 0,
          favoritePartners: ["sari_queen", "heru_battle_royale"],
        },
      },

      // Free Fire players
      {
        username: "heru_battle_royale",
        gameSlug: "free-fire",
        status: UserGameStatus.FAVORITE,
        playTime: 2100, // 35 hours
        lastPlayedAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        preferences: {
          chatEnabled: true,
          voiceEnabled: true,
          videoEnabled: false,
          notifications: true,
          autoJoin: true,
        },
        stats: {
          totalSessions: 250,
          totalMessages: 4000,
          totalVoiceTime: 75,
          totalVideoTime: 0,
          favoritePartners: ["sari_queen", "andi_fps"],
        },
      },

      // Genshin Impact players
      {
        username: "dewi_genshin",
        gameSlug: "genshin-impact",
        status: UserGameStatus.FAVORITE,
        playTime: 3600, // 60 hours
        lastPlayedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        preferences: {
          chatEnabled: true,
          voiceEnabled: false,
          videoEnabled: false,
          notifications: true,
          autoJoin: false,
        },
        stats: {
          totalSessions: 400,
          totalMessages: 1500,
          totalVoiceTime: 0,
          totalVideoTime: 0,
          favoritePartners: [],
        },
      },

      // Clash of Clans players
      {
        username: "rudi_clash",
        gameSlug: "clash-of-clans",
        status: UserGameStatus.FAVORITE,
        playTime: 4800, // 80 hours
        lastPlayedAt: new Date(Date.now() - 12 * 60 * 60 * 1000), // 12 hours ago
        preferences: {
          chatEnabled: true,
          voiceEnabled: false,
          videoEnabled: false,
          notifications: true,
          autoJoin: true,
        },
        stats: {
          totalSessions: 500,
          totalMessages: 800,
          totalVoiceTime: 0,
          totalVideoTime: 0,
          favoritePartners: [],
        },
      },

      // Clash Royale players
      {
        username: "bambang_strategy",
        gameSlug: "clash-royale",
        status: UserGameStatus.FAVORITE,
        playTime: 1200, // 20 hours
        lastPlayedAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
        preferences: {
          chatEnabled: true,
          voiceEnabled: false,
          videoEnabled: false,
          notifications: true,
          autoJoin: false,
        },
        stats: {
          totalSessions: 200,
          totalMessages: 1200,
          totalVoiceTime: 0,
          totalVideoTime: 0,
          favoritePartners: [],
        },
      },

      // Call of Duty Mobile players
      {
        username: "andi_fps",
        gameSlug: "call-of-duty-mobile",
        status: UserGameStatus.ACTIVE,
        playTime: 900, // 15 hours
        lastPlayedAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
        preferences: {
          chatEnabled: true,
          voiceEnabled: true,
          videoEnabled: false,
          notifications: true,
          autoJoin: true,
        },
        stats: {
          totalSessions: 120,
          totalMessages: 2000,
          totalVoiceTime: 30,
          totalVideoTime: 0,
          favoritePartners: ["sari_queen"],
        },
      },

      // Honkai: Star Rail players
      {
        username: "dewi_genshin",
        gameSlug: "honkai-star-rail",
        status: UserGameStatus.ACTIVE,
        playTime: 1800, // 30 hours
        lastPlayedAt: new Date(Date.now() - 8 * 60 * 60 * 1000), // 8 hours ago
        preferences: {
          chatEnabled: true,
          voiceEnabled: false,
          videoEnabled: false,
          notifications: true,
          autoJoin: false,
        },
        stats: {
          totalSessions: 150,
          totalMessages: 800,
          totalVoiceTime: 0,
          totalVideoTime: 0,
          favoritePartners: [],
        },
      },

      // FIFA Mobile players
      {
        username: "agus_sports",
        gameSlug: "fifa-mobile",
        status: UserGameStatus.FAVORITE,
        playTime: 1500, // 25 hours
        lastPlayedAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        preferences: {
          chatEnabled: true,
          voiceEnabled: true,
          videoEnabled: false,
          notifications: true,
          autoJoin: true,
        },
        stats: {
          totalSessions: 180,
          totalMessages: 1500,
          totalVoiceTime: 25,
          totalVideoTime: 0,
          favoritePartners: [],
        },
      },

      // 8 Ball Pool players
      {
        username: "agus_sports",
        gameSlug: "8-ball-pool",
        status: UserGameStatus.ACTIVE,
        playTime: 600, // 10 hours
        lastPlayedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        preferences: {
          chatEnabled: true,
          voiceEnabled: false,
          videoEnabled: false,
          notifications: true,
          autoJoin: false,
        },
        stats: {
          totalSessions: 100,
          totalMessages: 500,
          totalVoiceTime: 0,
          totalVideoTime: 0,
          favoritePartners: [],
        },
      },

      // Ludo King players
      {
        username: "siti_board",
        gameSlug: "ludo-king",
        status: UserGameStatus.FAVORITE,
        playTime: 800, // 13 hours
        lastPlayedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        preferences: {
          chatEnabled: true,
          voiceEnabled: false,
          videoEnabled: false,
          notifications: true,
          autoJoin: false,
        },
        stats: {
          totalSessions: 120,
          totalMessages: 800,
          totalVoiceTime: 0,
          totalVideoTime: 0,
          favoritePartners: ["nina_social"],
        },
      },

      // Chess.com players
      {
        username: "bambang_strategy",
        gameSlug: "chess-com",
        status: UserGameStatus.ACTIVE,
        playTime: 1000, // 16 hours
        lastPlayedAt: new Date(Date.now() - 6 * 60 * 60 * 1000), // 6 hours ago
        preferences: {
          chatEnabled: true,
          voiceEnabled: false,
          videoEnabled: false,
          notifications: true,
          autoJoin: false,
        },
        stats: {
          totalSessions: 150,
          totalMessages: 300,
          totalVoiceTime: 0,
          totalVideoTime: 0,
          favoritePartners: [],
        },
      },

      // Among Us players
      {
        username: "nina_social",
        gameSlug: "among-us",
        status: UserGameStatus.FAVORITE,
        playTime: 500, // 8 hours
        lastPlayedAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        preferences: {
          chatEnabled: true,
          voiceEnabled: true,
          videoEnabled: false,
          notifications: true,
          autoJoin: true,
        },
        stats: {
          totalSessions: 80,
          totalMessages: 2000,
          totalVoiceTime: 20,
          totalVideoTime: 0,
          favoritePartners: ["siti_board"],
        },
      },

      // Roblox players
      {
        username: "nina_social",
        gameSlug: "roblox",
        status: UserGameStatus.ACTIVE,
        playTime: 1200, // 20 hours
        lastPlayedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        preferences: {
          chatEnabled: true,
          voiceEnabled: true,
          videoEnabled: false,
          notifications: true,
          autoJoin: false,
        },
        stats: {
          totalSessions: 200,
          totalMessages: 3000,
          totalVoiceTime: 40,
          totalVideoTime: 0,
          favoritePartners: ["joko_sandbox"],
        },
      },

      // Minecraft players
      {
        username: "joko_sandbox",
        gameSlug: "minecraft",
        status: UserGameStatus.FAVORITE,
        playTime: 2400, // 40 hours
        lastPlayedAt: new Date(Date.now() - 3 * 60 * 60 * 1000), // 3 hours ago
        preferences: {
          chatEnabled: true,
          voiceEnabled: true,
          videoEnabled: false,
          notifications: true,
          autoJoin: true,
        },
        stats: {
          totalSessions: 300,
          totalMessages: 1500,
          totalVoiceTime: 60,
          totalVideoTime: 0,
          favoritePartners: ["nina_social"],
        },
      },

      // Subway Surfers players
      {
        username: "yuni_casual",
        gameSlug: "subway-surfers",
        status: UserGameStatus.ACTIVE,
        playTime: 300, // 5 hours
        lastPlayedAt: new Date(Date.now() - 1 * 60 * 60 * 1000), // 1 hour ago
        preferences: {
          chatEnabled: false,
          voiceEnabled: false,
          videoEnabled: false,
          notifications: true,
          autoJoin: false,
        },
        stats: {
          totalSessions: 50,
          totalMessages: 0,
          totalVoiceTime: 0,
          totalVideoTime: 0,
          favoritePartners: [],
        },
      },

      // Candy Crush players
      {
        username: "ratna_puzzle",
        gameSlug: "candy-crush-saga",
        status: UserGameStatus.FAVORITE,
        playTime: 600, // 10 hours
        lastPlayedAt: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
        preferences: {
          chatEnabled: false,
          voiceEnabled: false,
          videoEnabled: false,
          notifications: true,
          autoJoin: false,
        },
        stats: {
          totalSessions: 100,
          totalMessages: 0,
          totalVoiceTime: 0,
          totalVideoTime: 0,
          favoritePartners: [],
        },
      },

      // Street Fighter players
      {
        username: "doni_fighting",
        gameSlug: "street-fighter-duel",
        status: UserGameStatus.FAVORITE,
        playTime: 800, // 13 hours
        lastPlayedAt: new Date(Date.now() - 4 * 60 * 60 * 1000), // 4 hours ago
        preferences: {
          chatEnabled: true,
          voiceEnabled: false,
          videoEnabled: false,
          notifications: true,
          autoJoin: false,
        },
        stats: {
          totalSessions: 120,
          totalMessages: 800,
          totalVoiceTime: 0,
          totalVideoTime: 0,
          favoritePartners: [],
        },
      },

      // Asphalt 9 players
      {
        username: "maya_racing",
        gameSlug: "asphalt-9-legends",
        status: UserGameStatus.FAVORITE,
        playTime: 1000, // 16 hours
        lastPlayedAt: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
        preferences: {
          chatEnabled: true,
          voiceEnabled: false,
          videoEnabled: false,
          notifications: true,
          autoJoin: false,
        },
        stats: {
          totalSessions: 150,
          totalMessages: 600,
          totalVoiceTime: 0,
          totalVideoTime: 0,
          favoritePartners: [],
        },
      },
    ];

    for (const relationship of userGameRelationships) {
      const userId = userMap.get(relationship.username);
      const gameId = gameMap.get(relationship.gameSlug);

      if (!userId || !gameId) {
        console.log(
          `⚠️  Skipping relationship: ${relationship.username} -> ${relationship.gameSlug} (user or game not found)`
        );
        continue;
      }

      const existingRelationship = await userGameRepository.findOne({
        where: { userId, gameId },
      });

      if (!existingRelationship) {
        const userGame = userGameRepository.create({
          userId,
          gameId,
          status: relationship.status,
          playTime: relationship.playTime,
          lastPlayedAt: relationship.lastPlayedAt,
          preferences: relationship.preferences,
          stats: relationship.stats,
          addedAt: new Date(),
        });

        await userGameRepository.save(userGame);
        console.log(
          `✅ Seeded user-game relationship: ${relationship.username} -> ${relationship.gameSlug}`
        );
      } else {
        console.log(
          `⏭️  User-game relationship already exists: ${relationship.username} -> ${relationship.gameSlug}`
        );
      }
    }

    console.log("🎮 User-game relationships seeding completed!");
  }
}
