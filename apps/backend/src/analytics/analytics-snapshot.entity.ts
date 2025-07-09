import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  Index,
  CreateDateColumn,
} from "typeorm";

@Entity({ name: "analytics_snapshots" })
export class AnalyticsSnapshotEntity {
  @PrimaryGeneratedColumn()
  id?: number;

  @Index()
  @Column()
  streamId?: string;

  @CreateDateColumn()
  @Column()
  timestamp?: Date;

  @Column({ default: 0 })
  totalMessages?: number;

  @Column({ default: 0 })
  totalMentions?: number;

  @Column({ default: 0 })
  totalResponses?: number;

  @Column({ default: 0 })
  openaiResponses?: number;

  @Column({ default: 0 })
  uniqueViewers?: number;

  // Optionally, store extra JSON data for future analytics
  @Column({ type: "json", nullable: true })
  extra?: Record<string, any>;
}
