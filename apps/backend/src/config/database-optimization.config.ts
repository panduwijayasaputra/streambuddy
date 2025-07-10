import { ConfigService } from "@nestjs/config";

export interface DatabaseOptimizationConfig {
  // Connection Pool Settings
  pool: {
    min: number;
    max: number;
    acquireTimeoutMillis: number;
    createTimeoutMillis: number;
    destroyTimeoutMillis: number;
    idleTimeoutMillis: number;
    reapIntervalMillis: number;
    createRetryIntervalMillis: number;
  };

  // Query Optimization
  query: {
    timeout: number;
    statementTimeout: number;
    idleInTransactionSessionTimeout: number;
  };

  // Performance Settings
  performance: {
    synchronousCommit: boolean;
    walBuffers: number;
    sharedBuffers: string;
    effectiveCacheSize: string;
    workMem: string;
    maintenanceWorkMem: string;
    randomPageCost: number;
    effectiveIoConcurrency: number;
  };

  // Logging and Monitoring
  logging: {
    enabled: boolean;
    slowQueryThreshold: number;
    logSlowQueries: boolean;
    logParameters: boolean;
  };

  // SSL Configuration
  ssl: {
    enabled: boolean;
    rejectUnauthorized: boolean;
    ca?: string;
    cert?: string;
    key?: string;
  };
}

export function createDatabaseOptimizationConfig(
  configService: ConfigService
): DatabaseOptimizationConfig {
  const nodeEnv = configService.get<string>("NODE_ENV", "development");
  const isProduction = nodeEnv === "production";

  return {
    pool: {
      min: configService.get<number>("DB_POOL_MIN", isProduction ? 5 : 2),
      max: configService.get<number>("DB_POOL_MAX", isProduction ? 20 : 10),
      acquireTimeoutMillis: configService.get<number>(
        "DB_ACQUIRE_TIMEOUT",
        60000
      ),
      createTimeoutMillis: configService.get<number>(
        "DB_CREATE_TIMEOUT",
        30000
      ),
      destroyTimeoutMillis: configService.get<number>(
        "DB_DESTROY_TIMEOUT",
        5000
      ),
      idleTimeoutMillis: configService.get<number>("DB_IDLE_TIMEOUT", 30000),
      reapIntervalMillis: configService.get<number>("DB_REAP_INTERVAL", 1000),
      createRetryIntervalMillis: configService.get<number>(
        "DB_CREATE_RETRY_INTERVAL",
        200
      ),
    },

    query: {
      timeout: configService.get<number>("DB_QUERY_TIMEOUT", 30000),
      statementTimeout: configService.get<number>(
        "DB_STATEMENT_TIMEOUT",
        30000
      ),
      idleInTransactionSessionTimeout: configService.get<number>(
        "DB_IDLE_TRANSACTION_TIMEOUT",
        30000
      ),
    },

    performance: {
      synchronousCommit: configService.get<boolean>(
        "DB_SYNCHRONOUS_COMMIT",
        !isProduction
      ),
      walBuffers: configService.get<number>("DB_WAL_BUFFERS", 16),
      sharedBuffers: configService.get<string>("DB_SHARED_BUFFERS", "256MB"),
      effectiveCacheSize: configService.get<string>(
        "DB_EFFECTIVE_CACHE_SIZE",
        "1GB"
      ),
      workMem: configService.get<string>("DB_WORK_MEM", "4MB"),
      maintenanceWorkMem: configService.get<string>(
        "DB_MAINTENANCE_WORK_MEM",
        "64MB"
      ),
      randomPageCost: configService.get<number>("DB_RANDOM_PAGE_COST", 1.1),
      effectiveIoConcurrency: configService.get<number>(
        "DB_EFFECTIVE_IO_CONCURRENCY",
        1
      ),
    },

    logging: {
      enabled: configService.get<boolean>("DB_LOGGING_ENABLED", !isProduction),
      slowQueryThreshold: configService.get<number>(
        "DB_SLOW_QUERY_THRESHOLD",
        1000
      ),
      logSlowQueries: configService.get<boolean>("DB_LOG_SLOW_QUERIES", true),
      logParameters: configService.get<boolean>(
        "DB_LOG_PARAMETERS",
        !isProduction
      ),
    },

    ssl: {
      enabled: configService.get<boolean>("DB_SSL_ENABLED", isProduction),
      rejectUnauthorized: configService.get<boolean>(
        "DB_SSL_REJECT_UNAUTHORIZED",
        isProduction
      ),
      ca: configService.get<string>("DB_SSL_CA"),
      cert: configService.get<string>("DB_SSL_CERT"),
      key: configService.get<string>("DB_SSL_KEY"),
    },
  };
}
