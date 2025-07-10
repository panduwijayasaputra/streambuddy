import { DataSource } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { createDatabaseOptimizationConfig } from "./database-optimization.config";

export const createDatabaseConfig = (configService: ConfigService) => {
  const optimizationConfig = createDatabaseOptimizationConfig(configService);
  const nodeEnv = configService.get<string>("NODE_ENV", "development");
  const isProduction = nodeEnv === "production";

  return {
    type: "postgres" as const,
    host: configService.get("DB_HOST", "localhost"),
    port: configService.get("DB_PORT", 5432),
    username: configService.get("DB_USERNAME", "postgres"),
    password: configService.get("DB_PASSWORD", "postgres"),
    database: configService.get("DB_NAME", "streambuddy"),
    entities: [
      __dirname + "/../common/database/entities/**/*.entity{.ts,.js}",
      __dirname + "/../modules/chat-processing/entities/**/*.entity{.ts,.js}",
    ],
    migrations: [__dirname + "/../common/database/migrations/**/*{.ts,.js}"],
    synchronize: configService.get("NODE_ENV") === "development",
    logging: optimizationConfig.logging.enabled,

    // Connection Pool Configuration
    extra: {
      connectionLimit: optimizationConfig.pool.max,
      acquireTimeout: optimizationConfig.pool.acquireTimeoutMillis,
      timeout: optimizationConfig.query.timeout,
      statementTimeout: optimizationConfig.query.statementTimeout,
      idleInTransactionSessionTimeout:
        optimizationConfig.query.idleInTransactionSessionTimeout,
    },

    // SSL Configuration
    ssl: optimizationConfig.ssl.enabled
      ? {
          rejectUnauthorized: optimizationConfig.ssl.rejectUnauthorized,
          ca: optimizationConfig.ssl.ca,
          cert: optimizationConfig.ssl.cert,
          key: optimizationConfig.ssl.key,
        }
      : false,

    // Performance Optimizations
    cache: {
      duration: 30000, // 30 seconds
    },

    // Query Optimization
    maxQueryExecutionTime: optimizationConfig.logging.slowQueryThreshold,

    // Connection Pool Settings
    poolSize: optimizationConfig.pool.max,
    acquireTimeout: optimizationConfig.pool.acquireTimeoutMillis,
    timeout: optimizationConfig.pool.idleTimeoutMillis,
  };
};

export const AppDataSource = new DataSource({
  type: "postgres" as const,
  host: process.env.DB_HOST || "localhost",
  port: parseInt(process.env.DB_PORT || "5432"),
  username: process.env.DB_USERNAME || "postgres",
  password: process.env.DB_PASSWORD || "postgres",
  database: process.env.DB_NAME || "streambuddy",
  entities: [
    __dirname + "/../common/database/entities/**/*.entity{.ts,.js}",
    __dirname + "/../modules/chat-processing/entities/**/*.entity{.ts,.js}",
  ],
  migrations: [__dirname + "/../common/database/migrations/**/*{.ts,.js}"],
  synchronize: process.env.NODE_ENV === "development",
  logging: process.env.NODE_ENV === "development",
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});
