import { DataSource } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { createDatabaseConfig } from "./src/config/database.config";
import {
  User,
  Game,
  UserGame,
  ChatSession,
  ChatMessage,
  UserSubscription,
} from "./src/common/database/entities";

const configService = new ConfigService();

export default new DataSource({
  ...createDatabaseConfig(configService),
  entities: [User, Game, UserGame, ChatSession, ChatMessage, UserSubscription],
  migrations: ["src/common/database/migrations/*.ts"],
  migrationsTableName: "migrations",
});
