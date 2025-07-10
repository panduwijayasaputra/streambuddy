import { Injectable, Logger } from "@nestjs/common";
import { DataSource } from "typeorm";
import { ConfigService } from "@nestjs/config";

export interface QueryPerformance {
  query: string;
  executionTime: number;
  timestamp: Date;
  parameters?: any[];
}

export interface OptimizationRecommendation {
  type: "index" | "query" | "connection" | "cache";
  priority: "low" | "medium" | "high" | "critical";
  description: string;
  impact: string;
  sql?: string;
}

@Injectable()
export class DatabaseOptimizationService {
  private readonly logger = new Logger(DatabaseOptimizationService.name);
  private slowQueries: QueryPerformance[] = [];

  constructor(
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService
  ) {}

  async analyzeQueryPerformance(): Promise<QueryPerformance[]> {
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();

      // Get slow queries from PostgreSQL stats
      const result = await queryRunner.query(`
        SELECT 
          query,
          mean_exec_time,
          calls,
          total_exec_time
        FROM pg_stat_statements 
        WHERE mean_exec_time > 1000
        ORDER BY mean_exec_time DESC
        LIMIT 10
      `);

      return result.map((row: any) => ({
        query: row.query,
        executionTime: parseFloat(row.mean_exec_time),
        timestamp: new Date(),
      }));
    } finally {
      await queryRunner.release();
    }
  }

  async getMissingIndexes(): Promise<OptimizationRecommendation[]> {
    const queryRunner = this.dataSource.createQueryRunner();
    const recommendations: OptimizationRecommendation[] = [];

    try {
      await queryRunner.connect();

      // Find tables with sequential scans
      const seqScanResult = await queryRunner.query(`
        SELECT 
          schemaname,
          tablename,
          seq_scan,
          seq_tup_read,
          idx_scan,
          idx_tup_fetch
        FROM pg_stat_user_tables 
        WHERE seq_scan > idx_scan AND seq_scan > 100
        ORDER BY seq_scan DESC
      `);

      for (const table of seqScanResult) {
        recommendations.push({
          type: "index",
          priority: table.seq_scan > 1000 ? "high" : "medium",
          description: `Table ${table.tablename} has high sequential scans`,
          impact: `Sequential scans: ${table.seq_scan}, Index scans: ${table.idx_scan}`,
          sql: `-- Consider adding indexes for frequently queried columns in ${table.tablename}`,
        });
      }

      return recommendations;
    } finally {
      await queryRunner.release();
    }
  }

  async getConnectionPoolStats(): Promise<{
    active: number;
    idle: number;
    total: number;
    utilization: number;
  }> {
    // This would need to be implemented based on the specific connection pool
    // For now, return mock data
    const active = Math.floor(Math.random() * 10) + 1;
    const idle = Math.floor(Math.random() * 5) + 1;
    const total = active + idle;
    const utilization = (active / total) * 100;

    return {
      active,
      idle,
      total,
      utilization,
    };
  }

  async getCacheStats(): Promise<{
    hitRatio: number;
    sharedBuffers: string;
    effectiveCacheSize: string;
  }> {
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();

      const bufferHitResult = await queryRunner.query(`
        SELECT 
          round(100.0 * sum(heap_blks_hit) / (sum(heap_blks_hit) + sum(heap_blks_read)), 2) as buffer_hit_ratio
        FROM pg_statio_user_tables
      `);

      const settingsResult = await queryRunner.query(`
        SELECT 
          setting as shared_buffers
        FROM pg_settings 
        WHERE name = 'shared_buffers'
      `);

      const effectiveCacheResult = await queryRunner.query(`
        SELECT 
          setting as effective_cache_size
        FROM pg_settings 
        WHERE name = 'effective_cache_size'
      `);

      return {
        hitRatio: bufferHitResult[0]?.buffer_hit_ratio || 0,
        sharedBuffers: settingsResult[0]?.shared_buffers || "256MB",
        effectiveCacheSize:
          effectiveCacheResult[0]?.effective_cache_size || "1GB",
      };
    } finally {
      await queryRunner.release();
    }
  }

  async optimizeTable(tableName: string): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();

      // Analyze table statistics
      await queryRunner.query(`ANALYZE "${tableName}"`);

      // Vacuum table if needed
      await queryRunner.query(`VACUUM "${tableName}"`);

      this.logger.log(`Optimized table: ${tableName}`);
    } catch (error) {
      this.logger.error(`Failed to optimize table ${tableName}:`, error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }

  async getTableStats(tableName: string): Promise<{
    size: string;
    rows: number;
    indexes: number;
    lastVacuum: Date;
    lastAnalyze: Date;
  }> {
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();

      const sizeResult = await queryRunner.query(`
        SELECT pg_size_pretty(pg_total_relation_size('${tableName}')) as size
      `);

      const statsResult = await queryRunner.query(`
        SELECT 
          n_tup_ins + n_tup_upd + n_tup_del as total_rows,
          n_live_tup as live_rows,
          n_dead_tup as dead_rows,
          last_vacuum,
          last_analyze
        FROM pg_stat_user_tables 
        WHERE relname = '${tableName}'
      `);

      const indexResult = await queryRunner.query(`
        SELECT count(*) as index_count
        FROM pg_indexes 
        WHERE tablename = '${tableName}'
      `);

      return {
        size: sizeResult[0]?.size || "0 MB",
        rows: parseInt(statsResult[0]?.total_rows || "0"),
        indexes: parseInt(indexResult[0]?.index_count || "0"),
        lastVacuum: statsResult[0]?.last_vacuum || new Date(),
        lastAnalyze: statsResult[0]?.last_analyze || new Date(),
      };
    } finally {
      await queryRunner.release();
    }
  }

  async getOptimizationRecommendations(): Promise<
    OptimizationRecommendation[]
  > {
    const recommendations: OptimizationRecommendation[] = [];

    // Check connection pool utilization
    const poolStats = await this.getConnectionPoolStats();
    if (poolStats.utilization > 80) {
      recommendations.push({
        type: "connection",
        priority: "high",
        description: "Connection pool utilization is high",
        impact: `${poolStats.utilization.toFixed(1)}% utilization (${poolStats.active}/${poolStats.total} connections)`,
      });
    }

    // Check cache hit ratio
    const cacheStats = await this.getCacheStats();
    if (cacheStats.hitRatio < 90) {
      recommendations.push({
        type: "cache",
        priority: "medium",
        description: "Cache hit ratio is low",
        impact: `${cacheStats.hitRatio}% hit ratio (target: >90%)`,
      });
    }

    // Get missing indexes
    const missingIndexes = await this.getMissingIndexes();
    recommendations.push(...missingIndexes);

    return recommendations;
  }

  recordSlowQuery(
    query: string,
    executionTime: number,
    parameters?: any[]
  ): void {
    const slowQueryThreshold = this.configService.get<number>(
      "DB_SLOW_QUERY_THRESHOLD",
      1000
    );

    if (executionTime > slowQueryThreshold) {
      this.slowQueries.push({
        query,
        executionTime,
        timestamp: new Date(),
        parameters,
      });

      // Keep only last 100 slow queries
      if (this.slowQueries.length > 100) {
        this.slowQueries = this.slowQueries.slice(-100);
      }

      this.logger.warn(`Slow query detected: ${executionTime}ms`, {
        query,
        parameters,
      });
    }
  }

  getSlowQueries(): QueryPerformance[] {
    return [...this.slowQueries];
  }

  async vacuumDatabase(): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();

    try {
      await queryRunner.connect();
      await queryRunner.query("VACUUM ANALYZE");
      this.logger.log("Database vacuum completed");
    } catch (error) {
      this.logger.error("Failed to vacuum database:", error);
      throw error;
    } finally {
      await queryRunner.release();
    }
  }
}
