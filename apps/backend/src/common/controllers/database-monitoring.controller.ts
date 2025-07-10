import {
  Controller,
  Get,
  Post,
  HttpStatus,
  HttpException,
  Logger,
} from "@nestjs/common";
import { DatabaseMonitoringService } from "../services/database-monitoring.service";

@Controller("api/database/monitoring")
export class DatabaseMonitoringController {
  private readonly logger = new Logger(DatabaseMonitoringController.name);

  constructor(
    private readonly databaseMonitoringService: DatabaseMonitoringService
  ) {}

  @Get("metrics")
  async getDatabaseMetrics() {
    try {
      return await this.databaseMonitoringService.getDatabaseMetrics();
    } catch (error) {
      this.logger.error("Failed to get database metrics", error);
      throw new HttpException(
        `Failed to get database metrics: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get("performance/queries")
  async getQueryPerformanceHistory() {
    try {
      return {
        queries: this.databaseMonitoringService.getQueryPerformanceHistory(),
        slowQueries: this.databaseMonitoringService.getSlowQueries(),
      };
    } catch (error) {
      this.logger.error("Failed to get query performance history", error);
      throw new HttpException(
        `Failed to get query performance history: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get("performance/slow-queries")
  async getSlowQueries() {
    try {
      return {
        slowQueries: this.databaseMonitoringService.getSlowQueries(),
        count: this.databaseMonitoringService.getSlowQueries().length,
      };
    } catch (error) {
      this.logger.error("Failed to get slow queries", error);
      throw new HttpException(
        `Failed to get slow queries: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get("storage/tables")
  async getTableStatistics() {
    try {
      return {
        tables: await this.databaseMonitoringService.getTableStatistics(),
      };
    } catch (error) {
      this.logger.error("Failed to get table statistics", error);
      throw new HttpException(
        `Failed to get table statistics: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get("storage/indexes")
  async getIndexUsage() {
    try {
      return {
        indexes: await this.databaseMonitoringService.getIndexUsage(),
      };
    } catch (error) {
      this.logger.error("Failed to get index usage", error);
      throw new HttpException(
        `Failed to get index usage: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post("performance/clear-history")
  async clearQueryHistory() {
    try {
      this.databaseMonitoringService.clearQueryHistory();
      return { message: "Query performance history cleared successfully" };
    } catch (error) {
      this.logger.error("Failed to clear query history", error);
      throw new HttpException(
        `Failed to clear query history: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get("health/detailed")
  async getDetailedHealth() {
    try {
      const metrics = await this.databaseMonitoringService.getDatabaseMetrics();

      return {
        status: metrics.health.status,
        timestamp: new Date().toISOString(),
        issues: metrics.health.issues,
        recommendations: metrics.health.recommendations,
        metrics: {
          connectionPool: metrics.connectionPool,
          performance: metrics.performance,
          storage: metrics.storage,
        },
      };
    } catch (error) {
      this.logger.error("Failed to get detailed health", error);
      throw new HttpException(
        `Failed to get detailed health: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get("performance/summary")
  async getPerformanceSummary() {
    try {
      const metrics = await this.databaseMonitoringService.getDatabaseMetrics();
      const slowQueries = this.databaseMonitoringService.getSlowQueries();

      return {
        connectionPool: {
          utilization:
            metrics.connectionPool.total > 0
              ? (metrics.connectionPool.active / metrics.connectionPool.total) *
                100
              : 0,
          ...metrics.connectionPool,
        },
        performance: {
          ...metrics.performance,
          slowQueryPercentage:
            metrics.performance.totalQueries > 0
              ? (slowQueries.length / metrics.performance.totalQueries) * 100
              : 0,
        },
        storage: {
          ...metrics.storage,
          largestTable: metrics.storage.largestTables[0] || null,
        },
        health: metrics.health.status,
      };
    } catch (error) {
      this.logger.error("Failed to get performance summary", error);
      throw new HttpException(
        `Failed to get performance summary: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
