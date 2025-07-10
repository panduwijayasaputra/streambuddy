import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";

@Entity("response_templates")
export class ResponseTemplate {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  @Index()
  gameContext: string; // 'mobile-legends', 'free-fire', 'valorant', etc.

  @Column("text")
  keywords: string[]; // Array of keywords to match

  @Column("text")
  response: string;

  @Column({ default: 1 })
  priority: number;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: "jsonb", nullable: true })
  metadata?: {
    language?: string;
    difficulty?: string;
    category?: string;
    usageCount?: number;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
