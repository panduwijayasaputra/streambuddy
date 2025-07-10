import { Injectable, Logger } from "@nestjs/common";
import { DataSource } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { Cron, CronExpression } from "@nestjs/schedule";

export interface DatabaseMetrics {
  activeConnections: number;
  idleConnections: number;
  totalConnections: number;
  queryCount: number;
  slowQueries: number;
  averageQueryTime: number;
  cacheHitRatio: number;
  deadlocks: number;
  locks: number;
  bufferHitRatio: number;
  timestamp: Date;
}

@Injectable()
export class DatabaseMonitorService {
  private readonly logger = new Logger(DatabaseMonitorService.name);
  private metrics: DatabaseMetrics[] = [];
  private queryCount = 0;
  private slowQueryCount = 0;
  private totalQueryTime = 0;

  constructor(
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService
  ) {}

  @Cron(CronExpression.EVERY_MINUTE)
  async collectMetrics(): Promise<void> {
    try {
      const metrics = await this.getDatabaseMetrics();
      this.metrics.push(metrics);

      // Keep only last 24 hours of metrics
      const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
      this.metrics = this.metrics.filter((m) => m.timestamp > oneDayAgo);

      // Log if there are performance issues
      if (metrics.slowQueries > 0) {
        this.logger.warn(
          `Slow queries detected: ${metrics.slowQueries} in the last minute`
        );
      }

      if (
        metrics.activeConnections >
        this.configService.get("DB_POOL_MAX", 20) * 0.8
      ) {
        this.logger.warn(
          `High connection usage: ${metrics.activeConnections}/${metrics.totalConnections}`
        );
      }

      this.logger.debug("Database metrics collected", { metrics });
    } catch (error) {
      this.logger.error("Failed to collect database metrics", error);
    }
  }

  async getDatabaseMetrics(): Promise<DatabaseMetrics> {
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();

      // Get connection pool stats
      const poolStats = await this.getPoolStats();

      // Get PostgreSQL performance stats
      const pgStats = await this.getPostgreSQLStats(queryRunner);

      // Get cache stats
      const cacheStats = await this.getCacheStats(queryRunner);

      return {
        activeConnections: poolStats.activeConnections,
        idleConnections: poolStats.idleConnections,
        totalConnections: poolStats.totalConnections,
        queryCount: this.queryCount,
        slowQueries: this.slowQueryCount,
        averageQueryTime:
          this.queryCount > 0 ? this.totalQueryTime / this.queryCount : 0,
        cacheHitRatio: cacheStats.bufferHitRatio,
        deadlocks: pgStats.deadlocks,
        locks: pgStats.locks,
        bufferHitRatio: cacheStats.bufferHitRatio,
        timestamp: new Date(),
      };
    } finally {
      await queryRunner.release();
    }
  }

  private async getPoolStats() {
    // This would need to be implemented based on the specific connection pool being used
    // For now, return mock data
    return {
      activeConnections: Math.floor(Math.random() * 10) + 1,
      idleConnections: Math.floor(Math.random() * 5) + 1,
      totalConnections: Math.floor(Math.random() * 15) + 5,
    };
  }

  private async getPostgreSQLStats(queryRunner: any) {
    const deadlocksResult = await queryRunner.query(
      "SELECT datname, deadlocks FROM pg_stat_database WHERE datname = current_database()"
    );

    const locksResult = await queryRunner.query(
      "SELECT count(*) as lock_count FROM pg_locks WHERE NOT granted"
    );

    return {
      deadlocks: deadlocksResult[0]?.deadlocks || 0,
      locks: locksResult[0]?.lock_count || 0,
    };
  }

  private async getCacheStats(queryRunner: any) {
    const bufferHitResult = await queryRunner.query(`
      SELECT 
        round(100.0 * sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read)), 2) as buffer_hit_ratio
      FROM pg_statio_user_tables
    `);

    return {
      bufferHitRatio: bufferHitResult[0]?.buffer_hit_ratio || 0,
    };
  }

  recordQuery(executionTime: number): void {
    this.queryCount++;
    this.totalQueryTime += executionTime;

    const slowQueryThreshold = this.configService.get<number>(
      "DB_SLOW_QUERY_THRESHOLD",
      1000
    );
    if (executionTime > slowQueryThreshold) {
      this.slowQueryCount++;
      this.logger.warn(`Slow query detected: ${executionTime}ms`);
    }
  }

  getMetricsHistory(hours: number = 24): DatabaseMetrics[] {
    const cutoff = new Date(Date.now() - hours * 60 * 60 * 1000);
    return this.metrics.filter((m) => m.timestamp > cutoff);
  }

  getCurrentMetrics(): DatabaseMetrics | null {
    return this.metrics.length > 0
      ? this.metrics[this.metrics.length - 1]
      : null;
  }

  async getPerformanceRecommendations(): Promise<string[]> {
    const currentMetrics = this.getCurrentMetrics();
    if (!currentMetrics) return [];

    const recommendations: string[] = [];

    // Connection pool recommendations
    if (
      currentMetrics.activeConnections >
      currentMetrics.totalConnections * 0.8
    ) {
      recommendations.push("Consider increasing connection pool size");
    }

    if (currentMetrics.bufferHitRatio < 90) {
      recommendations.push(
        "Database cache hit ratio is low. Consider increasing shared_buffers"
      );
    }

    if (currentMetrics.slowQueries > 0) {
      recommendations.push(
        "Slow queries detected. Review query performance and add indexes"
      );
    }

    if (currentMetrics.deadlocks > 0) {
      recommendations.push(
        "Deadlocks detected. Review transaction isolation levels"
      );
    }

    return recommendations;
  }

  async getDatabaseSize(): Promise<{ size: string; tables: number }> {
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();

      const sizeResult = await queryRunner.query(`
        SELECT 
          pg_size_pretty(pg_database_size(current_database())) as size,
          count(*) as table_count
        FROM information_schema.tables 
        WHERE table_schema = 'public'
      `);

      return {
        size: sizeResult[0]?.size || "0 MB",
        tables: parseInt(sizeResult[0]?.table_count || "0"),
      };
    } finally {
      await queryRunner.release();
    }
  }

  async getTableSizes(): Promise<
    Array<{ table: string; size: string; rows: number }>
  > {
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();

      const result = await queryRunner.query(`
        SELECT 
          schemaname,
          tablename,
          pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
          n_tup_ins + n_tup_upd + n_tup_del as total_rows
        FROM pg_tables pt
        LEFT JOIN pg_stat_user_tables psut ON pt.tablename = psut.relname
        WHERE schemaname = 'public'
        ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
        LIMIT 10
      `);

      return result.map((row: any) => ({
        table: row.tablename,
        size: row.size,
        rows: parseInt(row.total_rows || "0"),
      }));
    } finally {
      await queryRunner.release();
    }
  }
}
