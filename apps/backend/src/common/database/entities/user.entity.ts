import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
  BeforeInsert,
  BeforeUpdate,
} from "typeorm";
import { Exclude } from "class-transformer";
import { ChatSession } from "./chat-session.entity";
import { UserGame } from "./user-game.entity";
import { UserSubscription } from "./user-subscription.entity";

export enum UserRole {
  USER = "user",
  PREMIUM = "premium",
  ADMIN = "admin",
}

export enum UserStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended",
}

@Entity("users")
@Index(["email"], { unique: true })
@Index(["username"], { unique: true })
export class User {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "varchar", length: 100, unique: true })
  username: string;

  @Column({ type: "varchar", length: 255, unique: true })
  email: string;

  @Column({ type: "varchar", length: 255 })
  @Exclude()
  password: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  firstName: string;

  @Column({ type: "varchar", length: 100, nullable: true })
  lastName: string;

  @Column({ type: "varchar", length: 255, nullable: true })
  avatar: string;

  @Column({ type: "text", nullable: true })
  bio: string;

  @Column({ type: "varchar", length: 20, default: UserRole.USER })
  role: UserRole;

  @Column({ type: "varchar", length: 20, default: UserStatus.ACTIVE })
  status: UserStatus;

  @Column({ type: "boolean", default: false })
  emailVerified: boolean;

  @Column({ type: "timestamp", nullable: true })
  emailVerifiedAt: Date;

  @Column({ type: "timestamp", nullable: true })
  lastLoginAt: Date;

  @Column({ type: "varchar", length: 45, nullable: true })
  lastLoginIp: string;

  @Column({ type: "jsonb", nullable: true })
  preferences: {
    language: string;
    theme: string;
    notifications: {
      email: boolean;
      push: boolean;
      chat: boolean;
    };
    privacy: {
      profileVisibility: string;
      showOnlineStatus: boolean;
    };
  };

  @Column({ type: "jsonb", nullable: true })
  metadata: {
    registrationSource: string;
    referrer: string;
    userAgent: string;
    timezone: string;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @OneToMany(() => ChatSession, (session) => session.user)
  chatSessions: ChatSession[];

  @OneToMany(() => UserGame, (userGame) => userGame.user)
  userGames: UserGame[];

  @OneToMany(() => UserSubscription, (subscription) => subscription.user)
  subscriptions: UserSubscription[];

  // Hooks
  @BeforeInsert()
  @BeforeUpdate()
  normalizeEmail() {
    if (this.email) {
      this.email = this.email.toLowerCase().trim();
    }
  }

  @BeforeInsert()
  @BeforeUpdate()
  normalizeUsername() {
    if (this.username) {
      this.username = this.username.toLowerCase().trim();
    }
  }

  // Helper methods
  get fullName(): string {
    return (
      `${this.firstName || ""} ${this.lastName || ""}`.trim() || this.username
    );
  }

  get isPremium(): boolean {
    return this.role === UserRole.PREMIUM || this.role === UserRole.ADMIN;
  }

  get isActive(): boolean {
    return this.status === UserStatus.ACTIVE;
  }
}
