import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";

@Entity("stream_chat_messages")
export class ChatMessage {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  @Index()
  streamSessionId: string;

  @Column()
  @Index()
  platform: string; // 'twitch', 'youtube', 'facebook', etc.

  @Column()
  @Index()
  userId: string;

  @Column()
  username: string;

  @Column("text")
  message: string;

  @Column({ nullable: true })
  response?: string;

  @Column({ default: "pending" })
  @Index()
  status: "pending" | "processed" | "filtered" | "responded" | "error";

  @Column({ type: "jsonb", nullable: true })
  metadata?: {
    gameContext?: string;
    priority?: number;
    isSpam?: boolean;
    isInappropriate?: boolean;
    language?: string;
    confidence?: number;
  };

  @Column({ type: "timestamp", nullable: true })
  processedAt?: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
