import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from "typeorm";

@Entity("game_knowledge")
export class GameKnowledge {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column()
  @Index()
  gameContext: string; // 'mobile-legends', 'free-fire', 'valorant', etc.

  @Column("text", { array: true })
  terminology: string[];

  @Column({ type: "jsonb" })
  buildRecommendations: Record<string, string[]>; // hero/champion -> builds

  @Column({ type: "jsonb" })
  metaInformation: {
    currentMeta?: string;
    tierList?: Record<string, string>;
    counters?: Record<string, string[]>;
    strategies?: string[];
  };

  @Column({ type: "jsonb", nullable: true })
  metadata?: {
    lastUpdated?: Date;
    version?: string;
    source?: string;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
