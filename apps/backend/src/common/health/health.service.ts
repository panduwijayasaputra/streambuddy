import { Injectable } from "@nestjs/common";
import { RedisService } from "../services/redis.service";
import { DataSource } from "typeorm";
import { OpenAIService } from "../services/openai.service";
import { ChatGateway } from "../gateways/chat.gateway";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class HealthService {
  constructor(
    private readonly redisService: RedisService,
    private readonly dataSource: DataSource,
    private readonly openaiService: OpenAIService,
    private readonly chatGateway: ChatGateway,
    private readonly configService: ConfigService
  ) {}

  async checkRedis(): Promise<{ status: "up" | "down"; message: string }> {
    try {
      const ping = await this.redisService.ping();
      if (ping === "PONG") {
        return { status: "up", message: "Redis is healthy" };
      }
      return { status: "down", message: "Redis ping failed" };
    } catch (error) {
      return { status: "down", message: `Redis error: ${error.message}` };
    }
  }

  async checkDatabase(): Promise<{
    status: "up" | "down";
    message: string;
    details?: {
      connectionPool: {
        total: number;
        active: number;
        idle: number;
      };
      performance: {
        avgQueryTime: number;
        slowQueries: number;
      };
      tables: {
        total: number;
        size: string;
      };
    };
  }> {
    try {
      const isConnected = this.dataSource.isInitialized;
      if (!isConnected) {
        return { status: "down", message: "Database not initialized" };
      }

      // Test the connection with a simple query
      await this.dataSource.query("SELECT 1");

      // Get connection pool information
      const pool = (this.dataSource.driver as any).pool;
      const connectionPool = {
        total: pool ? pool.totalCount || 0 : 0,
        active: pool ? pool.usedCount || 0 : 0,
        idle: pool ? pool.freeCount || 0 : 0,
      };

      // Get database size and table count
      const dbSizeResult = await this.dataSource.query(`
        SELECT 
          pg_size_pretty(pg_database_size(current_database())) as size,
          (SELECT count(*) FROM information_schema.tables WHERE table_schema = 'public') as table_count
      `);

      const tables = {
        total: parseInt(dbSizeResult[0]?.table_count || "0"),
        size: dbSizeResult[0]?.size || "0 MB",
      };

      // Get performance metrics (simplified)
      const performance = {
        avgQueryTime: 0, // Would need more sophisticated monitoring
        slowQueries: 0, // Would need query logging
      };

      return {
        status: "up",
        message: "Database is healthy",
        details: {
          connectionPool,
          performance,
          tables,
        },
      };
    } catch (error) {
      return { status: "down", message: `Database error: ${error.message}` };
    }
  }

  async checkOpenAI(): Promise<{ status: "up" | "down"; message: string }> {
    try {
      if (!this.openaiService.isConfigured()) {
        return { status: "down", message: "OpenAI not configured" };
      }

      // Try a simple API call to check connectivity
      const models = await this.openaiService.getModels();
      if (models && models.length > 0) {
        return { status: "up", message: "OpenAI is healthy" };
      }
      return { status: "down", message: "OpenAI API returned no models" };
    } catch (error) {
      return { status: "down", message: `OpenAI error: ${error.message}` };
    }
  }

  async checkWebSocket(): Promise<{
    status: "up" | "down";
    message: string;
    activeSessions?: number;
  }> {
    try {
      // Check if WebSocket server is running
      const activeSessions = this.chatGateway.getSessionCount();
      return {
        status: "up",
        message: "WebSocket is healthy",
        activeSessions,
      };
    } catch (error) {
      return { status: "down", message: `WebSocket error: ${error.message}` };
    }
  }

  async checkAll(): Promise<{
    status: "up" | "down";
    timestamp: string;
    services: {
      redis: { status: "up" | "down"; message: string };
      database: {
        status: "up" | "down";
        message: string;
        details?: {
          connectionPool: {
            total: number;
            active: number;
            idle: number;
          };
          performance: {
            avgQueryTime: number;
            slowQueries: number;
          };
          tables: {
            total: number;
            size: string;
          };
        };
      };
      openai: { status: "up" | "down"; message: string };
      websocket: {
        status: "up" | "down";
        message: string;
        activeSessions?: number;
      };
    };
  }> {
    const [redisHealth, databaseHealth, openaiHealth, websocketHealth] =
      await Promise.all([
        this.checkRedis(),
        this.checkDatabase(),
        this.checkOpenAI(),
        this.checkWebSocket(),
      ]);

    const overallStatus =
      redisHealth.status === "up" &&
      databaseHealth.status === "up" &&
      openaiHealth.status === "up" &&
      websocketHealth.status === "up"
        ? "up"
        : "down";

    return {
      status: overallStatus,
      timestamp: new Date().toISOString(),
      services: {
        redis: redisHealth,
        database: databaseHealth,
        openai: openaiHealth,
        websocket: websocketHealth,
      },
    };
  }
}
