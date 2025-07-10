import { ConfigService } from "@nestjs/config";

export const createRedisConfig = (configService: ConfigService) => ({
  host: configService.get("REDIS_HOST", "localhost"),
  port: configService.get("REDIS_PORT", 6379),
  password: configService.get("REDIS_PASSWORD", ""),
  db: configService.get("REDIS_DB", 0),
  retryDelayOnFailover: 100,
  enableReadyCheck: false,
  maxRetriesPerRequest: null,
  lazyConnect: true,
  keepAlive: 30000,
  connectTimeout: 10000,
  commandTimeout: 5000,
  retryDelayOnClusterDown: 300,
  enableOfflineQueue: false,
});

export const createRedisClusterConfig = (configService: ConfigService) => ({
  nodes: configService.get("REDIS_CLUSTER_NODES", []),
  options: {
    scaleReads: "slave",
    maxRetriesPerRequest: null,
    retryDelayOnFailover: 100,
    enableReadyCheck: false,
    lazyConnect: true,
    keepAlive: 30000,
    connectTimeout: 10000,
    commandTimeout: 5000,
    retryDelayOnClusterDown: 300,
    enableOfflineQueue: false,
  },
});
