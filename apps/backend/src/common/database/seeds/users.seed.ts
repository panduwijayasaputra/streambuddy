import { DataSource } from "typeorm";
import { User, UserRole, UserStatus } from "../entities/user.entity";
import * as bcrypt from "bcrypt";

export class UsersSeed {
  constructor(private dataSource: DataSource) {}

  async run(): Promise<void> {
    const userRepository = this.dataSource.getRepository(User);

    const users = [
      {
        username: "admin",
        email: "admin@streambuddy.com",
        password: await bcrypt.hash("admin123", 10),
        firstName: "Admin",
        lastName: "StreamBuddy",
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
        emailVerified: true,
        emailVerifiedAt: new Date(),
        preferences: {
          language: "id",
          theme: "dark",
          notifications: {
            email: true,
            push: true,
            chat: true,
          },
          privacy: {
            profileVisibility: "public",
            showOnlineStatus: true,
          },
        },
        metadata: {
          registrationSource: "manual",
          referrer: "direct",
          userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)",
          timezone: "Asia/Jakarta",
        },
      },
      {
        username: "budi_gamer",
        email: "budi@gmail.com",
        password: await bcrypt.hash("password123", 10),
        firstName: "Budi",
        lastName: "Santoso",
        role: UserRole.PREMIUM,
        status: UserStatus.ACTIVE,
        emailVerified: true,
        emailVerifiedAt: new Date(),
        bio: "Mobile Legends player sejak 2018. Suka main tank dan support!",
        preferences: {
          language: "id",
          theme: "dark",
          notifications: {
            email: false,
            push: true,
            chat: true,
          },
          privacy: {
            profileVisibility: "friends",
            showOnlineStatus: true,
          },
        },
        metadata: {
          registrationSource: "web",
          referrer: "google",
          userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0)",
          timezone: "Asia/Jakarta",
        },
      },
      {
        username: "sari_queen",
        email: "sari@yahoo.com",
        password: await bcrypt.hash("password123", 10),
        firstName: "Sari",
        lastName: "Wijaya",
        role: UserRole.PREMIUM,
        status: UserStatus.ACTIVE,
        emailVerified: true,
        emailVerifiedAt: new Date(),
        bio: "Gamer girl yang suka PUBG Mobile dan Free Fire. Pro player!",
        preferences: {
          language: "id",
          theme: "light",
          notifications: {
            email: true,
            push: true,
            chat: true,
          },
          privacy: {
            profileVisibility: "public",
            showOnlineStatus: false,
          },
        },
        metadata: {
          registrationSource: "mobile",
          referrer: "instagram",
          userAgent: "Mozilla/5.0 (Android 12)",
          timezone: "Asia/Jakarta",
        },
      },
      {
        username: "rudi_clash",
        email: "rudi@hotmail.com",
        password: await bcrypt.hash("password123", 10),
        firstName: "Rudi",
        lastName: "Hidayat",
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        emailVerified: true,
        emailVerifiedAt: new Date(),
        bio: "Clash of Clans veteran. TH14 maxed out!",
        preferences: {
          language: "id",
          theme: "dark",
          notifications: {
            email: false,
            push: true,
            chat: false,
          },
          privacy: {
            profileVisibility: "friends",
            showOnlineStatus: true,
          },
        },
        metadata: {
          registrationSource: "web",
          referrer: "facebook",
          userAgent: "Mozilla/5.0 (Windows NT 10.0)",
          timezone: "Asia/Jakarta",
        },
      },
      {
        username: "dewi_genshin",
        email: "dewi@gmail.com",
        password: await bcrypt.hash("password123", 10),
        firstName: "Dewi",
        lastName: "Kusuma",
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        emailVerified: true,
        emailVerifiedAt: new Date(),
        bio: "Genshin Impact player. AR60, semua karakter 5*!",
        preferences: {
          language: "en",
          theme: "dark",
          notifications: {
            email: true,
            push: false,
            chat: true,
          },
          privacy: {
            profileVisibility: "public",
            showOnlineStatus: true,
          },
        },
        metadata: {
          registrationSource: "mobile",
          referrer: "tiktok",
          userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0)",
          timezone: "Asia/Jakarta",
        },
      },
      {
        username: "andi_fps",
        email: "andi@outlook.com",
        password: await bcrypt.hash("password123", 10),
        firstName: "Andi",
        lastName: "Prasetyo",
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        emailVerified: true,
        emailVerifiedAt: new Date(),
        bio: "FPS player. PUBG Mobile dan Free Fire specialist!",
        preferences: {
          language: "id",
          theme: "dark",
          notifications: {
            email: false,
            push: true,
            chat: true,
          },
          privacy: {
            profileVisibility: "friends",
            showOnlineStatus: true,
          },
        },
        metadata: {
          registrationSource: "web",
          referrer: "youtube",
          userAgent: "Mozilla/5.0 (Android 11)",
          timezone: "Asia/Jakarta",
        },
      },
      {
        username: "lina_moba",
        email: "lina@gmail.com",
        password: await bcrypt.hash("password123", 10),
        firstName: "Lina",
        lastName: "Sari",
        role: UserRole.PREMIUM,
        status: UserStatus.ACTIVE,
        emailVerified: true,
        emailVerifiedAt: new Date(),
        bio: "Mobile Legends player. Mythic rank, main mage dan assassin!",
        preferences: {
          language: "id",
          theme: "light",
          notifications: {
            email: true,
            push: true,
            chat: true,
          },
          privacy: {
            profileVisibility: "public",
            showOnlineStatus: false,
          },
        },
        metadata: {
          registrationSource: "mobile",
          referrer: "twitter",
          userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0)",
          timezone: "Asia/Jakarta",
        },
      },
      {
        username: "tono_racing",
        email: "tono@yahoo.com",
        password: await bcrypt.hash("password123", 10),
        firstName: "Tono",
        lastName: "Saputra",
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        emailVerified: true,
        emailVerifiedAt: new Date(),
        bio: "Racing game enthusiast. Asphalt 9 dan Real Racing 3 player!",
        preferences: {
          language: "id",
          theme: "dark",
          notifications: {
            email: false,
            push: true,
            chat: false,
          },
          privacy: {
            profileVisibility: "friends",
            showOnlineStatus: true,
          },
        },
        metadata: {
          registrationSource: "web",
          referrer: "google",
          userAgent: "Mozilla/5.0 (Android 10)",
          timezone: "Asia/Jakarta",
        },
      },
      {
        username: "yuni_casual",
        email: "yuni@gmail.com",
        password: await bcrypt.hash("password123", 10),
        firstName: "Yuni",
        lastName: "Rahmawati",
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        emailVerified: true,
        emailVerifiedAt: new Date(),
        bio: "Casual gamer. Suka Candy Crush dan Subway Surfers!",
        preferences: {
          language: "id",
          theme: "light",
          notifications: {
            email: true,
            push: true,
            chat: false,
          },
          privacy: {
            profileVisibility: "friends",
            showOnlineStatus: false,
          },
        },
        metadata: {
          registrationSource: "mobile",
          referrer: "facebook",
          userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 14_0)",
          timezone: "Asia/Jakarta",
        },
      },
      {
        username: "bambang_strategy",
        email: "bambang@yahoo.com",
        password: await bcrypt.hash("password123", 10),
        firstName: "Bambang",
        lastName: "Wijaya",
        role: UserRole.PREMIUM,
        status: UserStatus.ACTIVE,
        emailVerified: true,
        emailVerifiedAt: new Date(),
        bio: "Strategy game lover. Clash Royale dan Chess.com player!",
        preferences: {
          language: "id",
          theme: "dark",
          notifications: {
            email: false,
            push: true,
            chat: true,
          },
          privacy: {
            profileVisibility: "public",
            showOnlineStatus: true,
          },
        },
        metadata: {
          registrationSource: "web",
          referrer: "linkedin",
          userAgent: "Mozilla/5.0 (Windows NT 10.0)",
          timezone: "Asia/Jakarta",
        },
      },
      {
        username: "nina_social",
        email: "nina@hotmail.com",
        password: await bcrypt.hash("password123", 10),
        firstName: "Nina",
        lastName: "Kartika",
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        emailVerified: true,
        emailVerifiedAt: new Date(),
        bio: "Social gamer. Among Us dan Roblox enthusiast!",
        preferences: {
          language: "id",
          theme: "light",
          notifications: {
            email: true,
            push: true,
            chat: true,
          },
          privacy: {
            profileVisibility: "public",
            showOnlineStatus: true,
          },
        },
        metadata: {
          registrationSource: "mobile",
          referrer: "tiktok",
          userAgent: "Mozilla/5.0 (Android 13)",
          timezone: "Asia/Jakarta",
        },
      },
      {
        username: "joko_sandbox",
        email: "joko@gmail.com",
        password: await bcrypt.hash("password123", 10),
        firstName: "Joko",
        lastName: "Susilo",
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        emailVerified: true,
        emailVerifiedAt: new Date(),
        bio: "Creative gamer. Minecraft dan Roblox builder!",
        preferences: {
          language: "id",
          theme: "dark",
          notifications: {
            email: false,
            push: true,
            chat: true,
          },
          privacy: {
            profileVisibility: "friends",
            showOnlineStatus: true,
          },
        },
        metadata: {
          registrationSource: "web",
          referrer: "youtube",
          userAgent: "Mozilla/5.0 (Windows NT 10.0)",
          timezone: "Asia/Jakarta",
        },
      },
      {
        username: "siti_board",
        email: "siti@yahoo.com",
        password: await bcrypt.hash("password123", 10),
        firstName: "Siti",
        lastName: "Nurhaliza",
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        emailVerified: true,
        emailVerifiedAt: new Date(),
        bio: "Board game lover. Ludo King dan Chess.com player!",
        preferences: {
          language: "id",
          theme: "light",
          notifications: {
            email: true,
            push: false,
            chat: true,
          },
          privacy: {
            profileVisibility: "friends",
            showOnlineStatus: false,
          },
        },
        metadata: {
          registrationSource: "mobile",
          referrer: "instagram",
          userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 15_0)",
          timezone: "Asia/Jakarta",
        },
      },
      {
        username: "agus_sports",
        email: "agus@outlook.com",
        password: await bcrypt.hash("password123", 10),
        firstName: "Agus",
        lastName: "Purnomo",
        role: UserRole.PREMIUM,
        status: UserStatus.ACTIVE,
        emailVerified: true,
        emailVerifiedAt: new Date(),
        bio: "Sports game enthusiast. FIFA Mobile dan 8 Ball Pool player!",
        preferences: {
          language: "id",
          theme: "dark",
          notifications: {
            email: true,
            push: true,
            chat: true,
          },
          privacy: {
            profileVisibility: "public",
            showOnlineStatus: true,
          },
        },
        metadata: {
          registrationSource: "web",
          referrer: "facebook",
          userAgent: "Mozilla/5.0 (Android 12)",
          timezone: "Asia/Jakarta",
        },
      },
      {
        username: "ratna_puzzle",
        email: "ratna@gmail.com",
        password: await bcrypt.hash("password123", 10),
        firstName: "Ratna",
        lastName: "Sari",
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        emailVerified: true,
        emailVerifiedAt: new Date(),
        bio: "Puzzle game lover. Candy Crush dan brain training games!",
        preferences: {
          language: "id",
          theme: "light",
          notifications: {
            email: true,
            push: true,
            chat: false,
          },
          privacy: {
            profileVisibility: "friends",
            showOnlineStatus: false,
          },
        },
        metadata: {
          registrationSource: "mobile",
          referrer: "google",
          userAgent: "Mozilla/5.0 (iPhone; CPU iPhone OS 16_0)",
          timezone: "Asia/Jakarta",
        },
      },
      {
        username: "doni_fighting",
        email: "doni@yahoo.com",
        password: await bcrypt.hash("password123", 10),
        firstName: "Doni",
        lastName: "Kusuma",
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        emailVerified: true,
        emailVerifiedAt: new Date(),
        bio: "Fighting game player. Street Fighter dan Tekken fan!",
        preferences: {
          language: "id",
          theme: "dark",
          notifications: {
            email: false,
            push: true,
            chat: true,
          },
          privacy: {
            profileVisibility: "public",
            showOnlineStatus: true,
          },
        },
        metadata: {
          registrationSource: "web",
          referrer: "twitter",
          userAgent: "Mozilla/5.0 (Windows NT 10.0)",
          timezone: "Asia/Jakarta",
        },
      },
      {
        username: "maya_racing",
        email: "maya@hotmail.com",
        password: await bcrypt.hash("password123", 10),
        firstName: "Maya",
        lastName: "Indah",
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        emailVerified: true,
        emailVerifiedAt: new Date(),
        bio: "Racing game enthusiast. Asphalt 9 dan Need for Speed player!",
        preferences: {
          language: "id",
          theme: "dark",
          notifications: {
            email: true,
            push: true,
            chat: false,
          },
          privacy: {
            profileVisibility: "friends",
            showOnlineStatus: true,
          },
        },
        metadata: {
          registrationSource: "mobile",
          referrer: "instagram",
          userAgent: "Mozilla/5.0 (Android 11)",
          timezone: "Asia/Jakarta",
        },
      },
      {
        username: "heru_battle_royale",
        email: "heru@gmail.com",
        password: await bcrypt.hash("password123", 10),
        firstName: "Heru",
        lastName: "Santoso",
        role: UserRole.PREMIUM,
        status: UserStatus.ACTIVE,
        emailVerified: true,
        emailVerifiedAt: new Date(),
        bio: "Battle Royale specialist. PUBG Mobile dan Free Fire pro!",
        preferences: {
          language: "id",
          theme: "dark",
          notifications: {
            email: false,
            push: true,
            chat: true,
          },
          privacy: {
            profileVisibility: "public",
            showOnlineStatus: true,
          },
        },
        metadata: {
          registrationSource: "web",
          referrer: "youtube",
          userAgent: "Mozilla/5.0 (Windows NT 10.0)",
          timezone: "Asia/Jakarta",
        },
      },
    ];

    for (const userData of users) {
      const existingUser = await userRepository.findOne({
        where: [{ email: userData.email }, { username: userData.username }],
      });

      if (!existingUser) {
        const user = userRepository.create(userData);
        await userRepository.save(user);
        console.log(`✅ Seeded user: ${user.username} (${user.email})`);
      } else {
        console.log(`⏭️  User already exists: ${userData.username}`);
      }
    }

    console.log("👥 Users seeding completed!");
  }
}
