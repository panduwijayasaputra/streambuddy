import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from "typeorm";

export enum GameCategory {
  MOBA = "moba",
  FPS = "fps",
  BATTLE_ROYALE = "battle_royale",
  STRATEGY = "strategy",
  RPG = "rpg",
  SPORTS = "sports",
  RACING = "racing",
  FIGHTING = "fighting",
  PUZZLE = "puzzle",
  CASUAL = "casual",
  BOARD = "board",
  SOCIAL = "social",
  SANDBOX = "sandbox",
  OTHER = "other",
}

export enum GameStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  COMING_SOON = "coming_soon",
}

@Entity("games")
@Index(["slug"], { unique: true })
@Index(["category"])
@Index(["status"])
export class Game {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 100 })
  name: string;

  @Column({ type: "varchar", length: 100, unique: true })
  slug: string;

  @Column({ type: "text", nullable: true })
  description: string;

  @Column({ type: "enum", enum: GameCategory })
  category: GameCategory;

  @Column({ type: "enum", enum: GameStatus, default: GameStatus.ACTIVE })
  status: GameStatus;

  @Column({ type: "varchar", length: 255, nullable: true })
  thumbnail: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  banner: string;

  @Column({ type: "jsonb", nullable: true })
  metadata: {
    publisher: string;
    releaseDate: string;
    platforms: string[];
    genres: string[];
    rating: string;
    playerCount: {
      min: number;
      max: number;
    };
  };

  @Column({ type: "jsonb", nullable: true })
  features: {
    hasChat: boolean;
    hasVoice: boolean;
    hasVideo: boolean;
    hasStreaming: boolean;
    hasTournaments: boolean;
    hasLeaderboards: boolean;
  };

  @Column({ type: "int", default: 0 })
  popularityScore: number;

  @Column({ type: "int", default: 0 })
  userCount: number;

  @Column({ type: "timestamp", nullable: true })
  lastUpdatedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany("UserGame", "game")
  userGames: any[];
}
