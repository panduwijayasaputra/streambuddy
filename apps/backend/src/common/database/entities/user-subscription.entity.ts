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

export enum SubscriptionPlan {
  FREE = "free",
  BASIC = "basic",
  PREMIUM = "premium",
  PRO = "pro",
}

export enum SubscriptionStatus {
  ACTIVE = "active",
  CANCELLED = "cancelled",
  EXPIRED = "expired",
  PAST_DUE = "past_due",
  TRIAL = "trial",
}

export enum BillingCycle {
  MONTHLY = "monthly",
  QUARTERLY = "quarterly",
  YEARLY = "yearly",
}

@Entity("user_subscriptions")
@Index(["userId"])
@Index(["status"])
@Index(["plan"])
@Index(["expiresAt"])
export class UserSubscription {
  @PrimaryGeneratedColumn("uuid")
  id: string;

  @Column({ type: "uuid" })
  userId: string;

  @Column({ type: "varchar", length: 20 })
  plan: SubscriptionPlan;

  @Column({ type: "varchar", length: 20, default: SubscriptionStatus.ACTIVE })
  status: SubscriptionStatus;

  @Column({ type: "varchar", length: 20, default: BillingCycle.MONTHLY })
  billingCycle: BillingCycle;

  @Column({ type: "decimal", precision: 10, scale: 2 })
  amount: number;

  @Column({ type: "varchar", length: 3, default: "USD" })
  currency: string;

  @Column({ type: "timestamp" })
  startsAt: Date;

  @Column({ type: "timestamp" })
  expiresAt: Date;

  @Column({ type: "timestamp", nullable: true })
  cancelledAt: Date;

  @Column({ type: "timestamp", nullable: true })
  trialEndsAt: Date;

  @Column({ type: "jsonb", nullable: true })
  features: {
    maxSessions: number;
    maxMessages: number;
    voiceEnabled: boolean;
    videoEnabled: boolean;
    prioritySupport: boolean;
    customModels: boolean;
    advancedAnalytics: boolean;
    apiAccess: boolean;
  };

  @Column({ type: "jsonb", nullable: true })
  billing: {
    paymentMethod: string;
    lastBilledAt: Date;
    nextBillingAt: Date;
    invoiceId: string;
    taxAmount: number;
    discountAmount: number;
  };

  @Column({ type: "jsonb", nullable: true })
  metadata: {
    source: string;
    referrer: string;
    campaign: string;
    affiliate: string;
    notes: string;
  };

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  // Relations
  @ManyToOne(() => User, (user) => user.subscriptions, { onDelete: "CASCADE" })
  @JoinColumn({ name: "userId" })
  user: User;

  // Helper methods
  get isActive(): boolean {
    return (
      this.status === SubscriptionStatus.ACTIVE && this.expiresAt > new Date()
    );
  }

  get isTrial(): boolean {
    return (
      this.status === SubscriptionStatus.TRIAL && this.trialEndsAt > new Date()
    );
  }

  get daysUntilExpiry(): number {
    const now = new Date();
    const expiry = new Date(this.expiresAt);
    const diffTime = expiry.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  }
}
