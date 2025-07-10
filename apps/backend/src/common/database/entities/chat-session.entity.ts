import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
  Index,
} from "typeorm";
import { User } from "./user.entity";
import { ChatMessage } from "./chat-message.entity";

export enum ChatSessionStatus {
  ACTIVE = "active",
  PAUSED = "paused",
  ENDED = "ended",
  ARCHIVED = "archived",
}

export enum ChatSessionType {
  PRIVATE = "private",
  GROUP = "group",
  GAME = "game",
  SUPPORT = "support",
}

@Entity("chat_sessions")
@Index(["userId"])
@Index(["status"])
@Index(["type"])
@Index(["gameId"])
export class ChatSession {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  userId: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  title: string;

  @Column({ type: "varchar", length: 20, default: ChatSessionType.PRIVATE })
  type: ChatSessionType;

  @Column({ type: "varchar", length: 20, default: ChatSessionStatus.ACTIVE })
  status: ChatSessionStatus;

  @Column({ type: "uuid", nullable: true })
  gameId: string;

  @Column({ type: "jsonb", nullable: true })
  participants: {
    userIds: string[];
    usernames: string[];
    roles: Record<string, string>;
  };

  @Column({ type: "jsonb", nullable: true })
  settings: {
    language: string;
    model: string;
    maxTokens: number;
    temperature: number;
    voiceEnabled: boolean;
    videoEnabled: boolean;
    autoTranslate: boolean;
  };

  @Column({ type: "jsonb", nullable: true })
  metadata: {
    sessionDuration: number; // in seconds
    messageCount: number;
    wordCount: number;
    averageResponseTime: number;
    topics: string[];
    sentiment: string;
  };

  @Column({ type: "timestamp", nullable: true })
  startedAt: Date;

  @Column({ type: "timestamp", nullable: true })
  endedAt: Date;

  @Column({ type: "timestamp", nullable: true })
  lastActivityAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.chatSessions, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user: User;

  @OneToMany(() => ChatMessage, (message) => message.chatSession)
  messages: ChatMessage[];
}
