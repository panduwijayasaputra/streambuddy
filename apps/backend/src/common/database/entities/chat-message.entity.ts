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
import { ChatSession } from "./chat-session.entity";

export enum MessageType {
  TEXT = "text",
  VOICE = "voice",
  VIDEO = "video",
  IMAGE = "image",
  FILE = "file",
  SYSTEM = "system",
  AI = "ai",
}

export enum MessageStatus {
  SENT = "sent",
  DELIVERED = "delivered",
  READ = "read",
  FAILED = "failed",
}

@Entity("chat_messages")
@Index(["chatSessionId"])
@Index(["senderId"])
@Index(["type"])
@Index(["status"])
@Index(["createdAt"])
export class ChatMessage {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  chatSessionId: string;

  @Column({ type: "uuid", nullable: true })
  senderId: string; // null for AI messages

  @Column({ type: "varchar", length: 20, default: MessageType.TEXT })
  type: MessageType;

  @Column({ type: "text" })
  content: string;

  @Column({ type: "varchar", length: 20, default: MessageStatus.SENT })
  status: MessageStatus;

  @Column({ type: "jsonb", nullable: true })
  metadata: {
    language: string;
    sentiment: string;
    topics: string[];
    entities: string[];
    intent: string;
    confidence: number;
    processingTime: number;
    tokens: number;
    model: string;
  };

  @Column({ type: "jsonb", nullable: true })
  media: {
    url: string;
    type: string;
    size: number;
    duration: number;
    thumbnail: string;
    transcription: string;
  };

  @Column({ type: "jsonb", nullable: true })
  reactions: Record<string, string[]>; // userId -> emoji[]

  @Column({ type: "jsonb", nullable: true })
  translations: Record<string, string>; // language -> translated text

  @Column({ type: "timestamp", nullable: true })
  deliveredAt: Date;

  @Column({ type: "timestamp", nullable: true })
  readAt: Date;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => ChatSession, (session) => session.messages, {
    onDelete: "CASCADE",
  })
  @JoinColumn({ name: "chatSessionId" })
  chatSession: ChatSession;
}
