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

  @Column({ name: "stream_session_id" })
  @Index()
  streamSessionId: string;

  @Column({ name: "platform" })
  @Index()
  platform: string; // 'twitch', 'youtube', 'facebook', etc.

  @Column({ name: "user_id" })
  @Index()
  userId: string;

  @Column({ name: "username" })
  username: string;

  @Column("text", { name: "message" })
  message: string;

  @Column({ name: "response", nullable: true })
  response?: string;

  @Column({ name: "status", default: "pending" })
  @Index()
  status: "pending" | "processed" | "filtered" | "responded" | "error";

  @Column({ name: "metadata", type: "jsonb", nullable: true })
  metadata?: {
    gameContext?: string;
    priority?: number;
    isSpam?: boolean;
    isInappropriate?: boolean;
    language?: string;
    confidence?: number;
  };

  @Column({ name: "processed_at", type: "timestamp", nullable: true })
  processedAt?: Date;

  @CreateDateColumn({ name: "created_at" })
  createdAt: Date;

  @UpdateDateColumn({ name: "updated_at" })
  updatedAt: Date;
}
