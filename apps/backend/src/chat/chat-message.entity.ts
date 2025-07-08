import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
} from "typeorm";

@Entity({ name: "chat_messages" })
export class ChatMessageEntity {
  @PrimaryGeneratedColumn("uuid")
  id!: string;

  @Column()
  userId!: string;

  @Column({ type: "text" })
  message!: string;

  @Column()
  platform!: string;

  @Column({ nullable: true })
  streamId?: string;

  @Column({ default: false })
  processed!: boolean;

  @Column({ type: "text", nullable: true })
  aiResponse?: string;

  @CreateDateColumn()
  createdAt!: Date;
}
