import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateInitialTables1700000000000 implements MigrationInterface {
  name = "CreateInitialTables1700000000000";

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create users table
    await queryRunner.query(`
      CREATE TYPE "public"."user_role_enum" AS ENUM('user', 'premium', 'admin')
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."user_status_enum" AS ENUM('active', 'inactive', 'suspended')
    `);
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "username" character varying(100) NOT NULL,
        "email" character varying(255) NOT NULL,
        "password" character varying(255) NOT NULL,
        "firstName" character varying(100),
        "lastName" character varying(100),
        "avatar" character varying(255),
        "bio" text,
        "role" "public"."user_role_enum" NOT NULL DEFAULT 'user',
        "status" "public"."user_status_enum" NOT NULL DEFAULT 'active',
        "emailVerified" boolean NOT NULL DEFAULT false,
        "emailVerifiedAt" TIMESTAMP,
        "lastLoginAt" TIMESTAMP,
        "lastLoginIp" character varying(45),
        "preferences" jsonb,
        "metadata" jsonb,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_fe0bb3f6570c403f5ece602dc73" UNIQUE ("email"),
        CONSTRAINT "UQ_78a916df40e02a9deb1c4b75edb" UNIQUE ("username"),
        CONSTRAINT "PK_a3ffb1c0c8416b9fc6f907b7433" PRIMARY KEY ("id")
      )
    `);

    // Create games table
    await queryRunner.query(`
      CREATE TYPE "public"."game_category_enum" AS ENUM('moba', 'fps', 'battle_royale', 'strategy', 'rpg', 'sports', 'racing', 'fighting', 'puzzle', 'other')
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."game_status_enum" AS ENUM('active', 'inactive', 'coming_soon')
    `);
    await queryRunner.query(`
      CREATE TABLE "games" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "name" character varying(100) NOT NULL,
        "slug" character varying(100) NOT NULL,
        "description" text,
        "category" "public"."game_category_enum" NOT NULL,
        "status" "public"."game_status_enum" NOT NULL DEFAULT 'active',
        "thumbnail" character varying(255),
        "banner" character varying(255),
        "metadata" jsonb,
        "features" jsonb,
        "popularityScore" integer NOT NULL DEFAULT '0',
        "userCount" integer NOT NULL DEFAULT '0',
        "lastUpdatedAt" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_7b8b8f8b8b8b8b8b8b8b8b8b8b8" UNIQUE ("slug"),
        CONSTRAINT "PK_c388b1d5e7de31cc72c30761e3f" PRIMARY KEY ("id")
      )
    `);

    // Create user_games table
    await queryRunner.query(`
      CREATE TYPE "public"."user_game_status_enum" AS ENUM('active', 'inactive', 'favorite')
    `);
    await queryRunner.query(`
      CREATE TABLE "user_games" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "gameId" uuid NOT NULL,
        "status" "public"."user_game_status_enum" NOT NULL DEFAULT 'active',
        "playTime" integer NOT NULL DEFAULT '0',
        "lastPlayedAt" TIMESTAMP,
        "preferences" jsonb,
        "stats" jsonb,
        "addedAt" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_user_game_unique" UNIQUE ("userId", "gameId"),
        CONSTRAINT "PK_8b8b8b8b8b8b8b8b8b8b8b8b8b8" PRIMARY KEY ("id")
      )
    `);

    // Create chat_sessions table
    await queryRunner.query(`
      CREATE TYPE "public"."chat_session_status_enum" AS ENUM('active', 'paused', 'ended', 'archived')
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."chat_session_type_enum" AS ENUM('private', 'group', 'game', 'support')
    `);
    await queryRunner.query(`
      CREATE TABLE "chat_sessions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "title" character varying(100),
        "type" "public"."chat_session_type_enum" NOT NULL DEFAULT 'private',
        "status" "public"."chat_session_status_enum" NOT NULL DEFAULT 'active',
        "gameId" uuid,
        "participants" jsonb,
        "settings" jsonb,
        "metadata" jsonb,
        "startedAt" TIMESTAMP,
        "endedAt" TIMESTAMP,
        "lastActivityAt" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_9b9b9b9b9b9b9b9b9b9b9b9b9b9" PRIMARY KEY ("id")
      )
    `);

    // Create chat_messages table
    await queryRunner.query(`
      CREATE TYPE "public"."message_type_enum" AS ENUM('text', 'voice', 'video', 'image', 'file', 'system', 'ai')
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."message_status_enum" AS ENUM('sent', 'delivered', 'read', 'failed')
    `);
    await queryRunner.query(`
      CREATE TABLE "chat_messages" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "chatSessionId" uuid NOT NULL,
        "senderId" uuid,
        "type" "public"."message_type_enum" NOT NULL DEFAULT 'text',
        "content" text NOT NULL,
        "status" "public"."message_status_enum" NOT NULL DEFAULT 'sent',
        "metadata" jsonb,
        "media" jsonb,
        "reactions" jsonb,
        "translations" jsonb,
        "deliveredAt" TIMESTAMP,
        "readAt" TIMESTAMP,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_0a0a0a0a0a0a0a0a0a0a0a0a0a0a" PRIMARY KEY ("id")
      )
    `);

    // Create user_subscriptions table
    await queryRunner.query(`
      CREATE TYPE "public"."subscription_plan_enum" AS ENUM('free', 'basic', 'premium', 'pro')
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."subscription_status_enum" AS ENUM('active', 'cancelled', 'expired', 'past_due', 'trial')
    `);
    await queryRunner.query(`
      CREATE TYPE "public"."billing_cycle_enum" AS ENUM('monthly', 'quarterly', 'yearly')
    `);
    await queryRunner.query(`
      CREATE TABLE "user_subscriptions" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "userId" uuid NOT NULL,
        "plan" "public"."subscription_plan_enum" NOT NULL,
        "status" "public"."subscription_status_enum" NOT NULL DEFAULT 'active',
        "billingCycle" "public"."billing_cycle_enum" NOT NULL DEFAULT 'monthly',
        "amount" decimal(10,2) NOT NULL,
        "currency" character varying(3) NOT NULL DEFAULT 'USD',
        "startsAt" TIMESTAMP NOT NULL,
        "expiresAt" TIMESTAMP NOT NULL,
        "cancelledAt" TIMESTAMP,
        "trialEndsAt" TIMESTAMP,
        "features" jsonb,
        "billing" jsonb,
        "metadata" jsonb,
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        CONSTRAINT "PK_1b1b1b1b1b1b1b1b1b1b1b1b1b1b" PRIMARY KEY ("id")
      )
    `);

    // Create indexes
    await queryRunner.query(
      `CREATE INDEX "IDX_users_email" ON "users" ("email")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_users_username" ON "users" ("username")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_games_slug" ON "games" ("slug")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_games_category" ON "games" ("category")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_games_status" ON "games" ("status")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_user_games_userId" ON "user_games" ("userId")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_user_games_gameId" ON "user_games" ("gameId")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_chat_sessions_userId" ON "chat_sessions" ("userId")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_chat_sessions_status" ON "chat_sessions" ("status")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_chat_sessions_type" ON "chat_sessions" ("type")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_chat_sessions_gameId" ON "chat_sessions" ("gameId")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_chat_messages_chatSessionId" ON "chat_messages" ("chatSessionId")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_chat_messages_senderId" ON "chat_messages" ("senderId")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_chat_messages_type" ON "chat_messages" ("type")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_chat_messages_status" ON "chat_messages" ("status")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_chat_messages_createdAt" ON "chat_messages" ("createdAt")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_user_subscriptions_userId" ON "user_subscriptions" ("userId")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_user_subscriptions_status" ON "user_subscriptions" ("status")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_user_subscriptions_plan" ON "user_subscriptions" ("plan")`
    );
    await queryRunner.query(
      `CREATE INDEX "IDX_user_subscriptions_expiresAt" ON "user_subscriptions" ("expiresAt")`
    );

    // Create foreign key constraints
    await queryRunner.query(`
      ALTER TABLE "user_games" ADD CONSTRAINT "FK_user_games_userId" 
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "user_games" ADD CONSTRAINT "FK_user_games_gameId" 
      FOREIGN KEY ("gameId") REFERENCES "games"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "chat_sessions" ADD CONSTRAINT "FK_chat_sessions_userId" 
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "chat_messages" ADD CONSTRAINT "FK_chat_messages_chatSessionId" 
      FOREIGN KEY ("chatSessionId") REFERENCES "chat_sessions"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "chat_messages" ADD CONSTRAINT "FK_chat_messages_senderId" 
      FOREIGN KEY ("senderId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE NO ACTION
    `);
    await queryRunner.query(`
      ALTER TABLE "user_subscriptions" ADD CONSTRAINT "FK_user_subscriptions_userId" 
      FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE NO ACTION
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop foreign key constraints
    await queryRunner.query(
      `ALTER TABLE "user_subscriptions" DROP CONSTRAINT "FK_user_subscriptions_userId"`
    );
    await queryRunner.query(
      `ALTER TABLE "chat_messages" DROP CONSTRAINT "FK_chat_messages_senderId"`
    );
    await queryRunner.query(
      `ALTER TABLE "chat_messages" DROP CONSTRAINT "FK_chat_messages_chatSessionId"`
    );
    await queryRunner.query(
      `ALTER TABLE "chat_sessions" DROP CONSTRAINT "FK_chat_sessions_userId"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_games" DROP CONSTRAINT "FK_user_games_gameId"`
    );
    await queryRunner.query(
      `ALTER TABLE "user_games" DROP CONSTRAINT "FK_user_games_userId"`
    );

    // Drop indexes
    await queryRunner.query(`DROP INDEX "IDX_user_subscriptions_expiresAt"`);
    await queryRunner.query(`DROP INDEX "IDX_user_subscriptions_plan"`);
    await queryRunner.query(`DROP INDEX "IDX_user_subscriptions_status"`);
    await queryRunner.query(`DROP INDEX "IDX_user_subscriptions_userId"`);
    await queryRunner.query(`DROP INDEX "IDX_chat_messages_createdAt"`);
    await queryRunner.query(`DROP INDEX "IDX_chat_messages_status"`);
    await queryRunner.query(`DROP INDEX "IDX_chat_messages_type"`);
    await queryRunner.query(`DROP INDEX "IDX_chat_messages_senderId"`);
    await queryRunner.query(`DROP INDEX "IDX_chat_messages_chatSessionId"`);
    await queryRunner.query(`DROP INDEX "IDX_chat_sessions_gameId"`);
    await queryRunner.query(`DROP INDEX "IDX_chat_sessions_type"`);
    await queryRunner.query(`DROP INDEX "IDX_chat_sessions_status"`);
    await queryRunner.query(`DROP INDEX "IDX_chat_sessions_userId"`);
    await queryRunner.query(`DROP INDEX "IDX_user_games_gameId"`);
    await queryRunner.query(`DROP INDEX "IDX_user_games_userId"`);
    await queryRunner.query(`DROP INDEX "IDX_games_status"`);
    await queryRunner.query(`DROP INDEX "IDX_games_category"`);
    await queryRunner.query(`DROP INDEX "IDX_games_slug"`);
    await queryRunner.query(`DROP INDEX "IDX_users_username"`);
    await queryRunner.query(`DROP INDEX "IDX_users_email"`);

    // Drop tables
    await queryRunner.query(`DROP TABLE "user_subscriptions"`);
    await queryRunner.query(`DROP TABLE "chat_messages"`);
    await queryRunner.query(`DROP TABLE "chat_sessions"`);
    await queryRunner.query(`DROP TABLE "user_games"`);
    await queryRunner.query(`DROP TABLE "games"`);
    await queryRunner.query(`DROP TABLE "users"`);

    // Drop enums
    await queryRunner.query(`DROP TYPE "public"."billing_cycle_enum"`);
    await queryRunner.query(`DROP TYPE "public"."subscription_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."subscription_plan_enum"`);
    await queryRunner.query(`DROP TYPE "public"."message_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."message_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."chat_session_type_enum"`);
    await queryRunner.query(`DROP TYPE "public"."chat_session_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."user_game_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."game_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."game_category_enum"`);
    await queryRunner.query(`DROP TYPE "public"."user_status_enum"`);
    await queryRunner.query(`DROP TYPE "public"."user_role_enum"`);
  }
}
