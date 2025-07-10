import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
  Index,
} from "typeorm";
import { User } from "./user.entity";
import { Game } from "./game.entity";

export enum UserGameStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  FAVORITE = "favorite",
}

@Entity("user_games")
@Index(["userId", "gameId"], { unique: true })
@Index(["userId"])
@Index(["gameId"])
export class UserGame {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  userId: string;

  @Column({ type: "uuid" })
  gameId: string;

  @Column({ type: "varchar", length: 20, default: UserGameStatus.ACTIVE })
  status: UserGameStatus;

  @Column({ type: "int", default: 0 })
  playTime: number; // in minutes

  @Column({ type: "timestamp", nullable: true })
  lastPlayedAt: Date;

  @Column({ type: "jsonb", nullable: true })
  preferences: {
    chatEnabled: boolean;
    voiceEnabled: boolean;
    videoEnabled: boolean;
    notifications: boolean;
    autoJoin: boolean;
  };

  @Column({ type: "jsonb", nullable: true })
  stats: {
    totalSessions: number;
    totalMessages: number;
    totalVoiceTime: number;
    totalVideoTime: number;
    favoritePartners: string[];
  };

  @Column({ type: "timestamp", nullable: true })
  addedAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.userGames, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user: User;

  @ManyToOne(() => Game, (game) => game.userGames, { onDelete: "CASCADE" })
  @JoinColumn({ name: "gameId" })
  game: Game;
}
