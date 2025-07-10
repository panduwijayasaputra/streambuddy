import { Injectable, Logger } from "@nestjs/common";
import { DataSource } from "typeorm";
import { ConfigService } from "@nestjs/config";

export interface DatabaseMetrics {
  connectionPool: {
    total: number;
    active: number;
    idle: number;
    waiting: number;
  };
  performance: {
    avgQueryTime: number;
    slowQueries: number;
    totalQueries: number;
    cacheHitRatio: number;
  };
  storage: {
    databaseSize: string;
    tableCount: number;
    indexCount: number;
    largestTables: Array<{
      name: string;
      size: string;
      rowCount: number;
    }>;
  };
  health: {
    status: "healthy" | "warning" | "critical";
    issues: string[];
    recommendations: string[];
  };
}

export interface QueryPerformance {
  query: string;
  executionTime: number;
  timestamp: Date;
  slow: boolean;
}

@Injectable()
export class DatabaseMonitoringService {
  private readonly logger = new Logger(DatabaseMonitoringService.name);
  private queryPerformance: QueryPerformance[] = [];
  private readonly maxQueryHistory = 1000;

  constructor(
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService
  ) {}

  async getDatabaseMetrics(): Promise<DatabaseMetrics> {
    try {
      const [connectionPool, performance, storage, health] = await Promise.all([
        this.getConnectionPoolMetrics(),
        this.getPerformanceMetrics(),
        this.getStorageMetrics(),
        this.getHealthAssessment(),
      ]);

      return {
        connectionPool,
        performance,
        storage,
        health,
      };
    } catch (error) {
      this.logger.error("Failed to get database metrics", error);
      throw error;
    }
  }

  private async getConnectionPoolMetrics() {
    try {
      const pool = (this.dataSource.driver as any).pool;

      if (!pool) {
        return {
          total: 0,
          active: 0,
          idle: 0,
          waiting: 0,
        };
      }

      return {
        total: pool.totalCount || 0,
        active: pool.usedCount || 0,
        idle: pool.freeCount || 0,
        waiting: pool.pendingCount || 0,
      };
    } catch (error) {
      this.logger.error("Failed to get connection pool metrics", error);
      return {
        total: 0,
        active: 0,
        idle: 0,
        waiting: 0,
      };
    }
  }

  private async getPerformanceMetrics() {
    try {
      // Get query performance from our tracking
      const recentQueries = this.queryPerformance.slice(-100);
      const avgQueryTime =
        recentQueries.length > 0
          ? recentQueries.reduce((sum, q) => sum + q.executionTime, 0) /
            recentQueries.length
          : 0;

      const slowQueries = recentQueries.filter((q) => q.slow).length;
      const totalQueries = recentQueries.length;

      // Get cache hit ratio from PostgreSQL
      const cacheResult = await this.dataSource.query(`
        SELECT 
          sum(heap_blks_hit) as hits,
          sum(heap_blks_read) as reads
        FROM pg_statio_user_tables
      `);

      const hits = parseInt(cacheResult[0]?.hits || "0");
      const reads = parseInt(cacheResult[0]?.reads || "0");
      const cacheHitRatio =
        hits + reads > 0 ? (hits / (hits + reads)) * 100 : 0;

      return {
        avgQueryTime,
        slowQueries,
        totalQueries,
        cacheHitRatio,
      };
    } catch (error) {
      this.logger.error("Failed to get performance metrics", error);
      return {
        avgQueryTime: 0,
        slowQueries: 0,
        totalQueries: 0,
        cacheHitRatio: 0,
      };
    }
  }

  private async getStorageMetrics() {
    try {
      // Get database size
      const dbSizeResult = await this.dataSource.query(`
        SELECT pg_size_pretty(pg_database_size(current_database())) as size
      `);

      // Get table count
      const tableCountResult = await this.dataSource.query(`
        SELECT count(*) as count FROM information_schema.tables WHERE table_schema = 'public'
      `);

      // Get index count
      const indexCountResult = await this.dataSource.query(`
        SELECT count(*) as count FROM pg_indexes WHERE schemaname = 'public'
      `);

      // Get largest tables
      const largestTablesResult = await this.dataSource.query(`
        SELECT 
          schemaname,
          tablename as name,
          pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
          pg_total_relation_size(schemaname||'.'||tablename) as size_bytes
        FROM pg_tables 
        WHERE schemaname = 'public'
        ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
        LIMIT 10
      `);

      const largestTables = largestTablesResult.map((table: any) => ({
        name: table.name,
        size: table.size,
        rowCount: 0, // Would need additional query for each table
      }));

      return {
        databaseSize: dbSizeResult[0]?.size || "0 MB",
        tableCount: parseInt(tableCountResult[0]?.count || "0"),
        indexCount: parseInt(indexCountResult[0]?.count || "0"),
        largestTables,
      };
    } catch (error) {
      this.logger.error("Failed to get storage metrics", error);
      return {
        databaseSize: "0 MB",
        tableCount: 0,
        indexCount: 0,
        largestTables: [],
      };
    }
  }

  private async getHealthAssessment() {
    const issues: string[] = [];
    const recommendations: string[] = [];

    try {
      const metrics = await this.getDatabaseMetrics();

      // Check connection pool health
      const pool = metrics.connectionPool;
      if (pool.active / pool.total > 0.8) {
        issues.push("High connection pool utilization");
        recommendations.push(
          "Consider increasing max connections or optimizing queries"
        );
      }

      if (pool.waiting > 0) {
        issues.push("Connections waiting in pool");
        recommendations.push("Database may be under heavy load");
      }

      // Check performance
      const perf = metrics.performance;
      if (perf.avgQueryTime > 1000) {
        issues.push("High average query time");
        recommendations.push("Consider query optimization or indexing");
      }

      if (perf.cacheHitRatio < 80) {
        issues.push("Low cache hit ratio");
        recommendations.push(
          "Consider increasing shared_buffers or optimizing queries"
        );
      }

      // Check storage
      const storage = metrics.storage;
      if (storage.largestTables.length > 0) {
        const largestTable = storage.largestTables[0];
        if (largestTable.size.includes("GB")) {
          issues.push("Large table detected");
          recommendations.push(
            "Consider table partitioning or archiving old data"
          );
        }
      }

      // Determine overall health status
      let status: "healthy" | "warning" | "critical" = "healthy";
      if (issues.length > 2) {
        status = "critical";
      } else if (issues.length > 0) {
        status = "warning";
      }

      return {
        status,
        issues,
        recommendations,
      };
    } catch (error) {
      this.logger.error("Failed to assess database health", error);
      return {
        status: "critical" as const,
        issues: ["Unable to assess database health"],
        recommendations: ["Check database connectivity and permissions"],
      };
    }
  }

  trackQueryPerformance(query: string, executionTime: number) {
    const slowThreshold = this.configService.get<number>(
      "DB_SLOW_QUERY_THRESHOLD",
      1000
    );

    const queryPerformance: QueryPerformance = {
      query: query.substring(0, 200), // Truncate long queries
      executionTime,
      timestamp: new Date(),
      slow: executionTime > slowThreshold,
    };

    this.queryPerformance.push(queryPerformance);

    // Keep only the last N queries
    if (this.queryPerformance.length > this.maxQueryHistory) {
      this.queryPerformance = this.queryPerformance.slice(
        -this.maxQueryHistory
      );
    }

    // Log slow queries
    if (queryPerformance.slow) {
      this.logger.warn(
        `Slow query detected: ${executionTime}ms - ${queryPerformance.query}`
      );
    }
  }

  getQueryPerformanceHistory(): QueryPerformance[] {
    return [...this.queryPerformance];
  }

  getSlowQueries(): QueryPerformance[] {
    return this.queryPerformance.filter((q) => q.slow);
  }

  async getTableStatistics(): Promise<
    Array<{
      name: string;
      size: string;
      rowCount: number;
      lastAnalyzed: Date;
    }>
  > {
    try {
      const result = await this.dataSource.query(`
        SELECT 
          schemaname,
          tablename as name,
          pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
          pg_total_relation_size(schemaname||'.'||tablename) as size_bytes,
          n_tup_ins as inserts,
          n_tup_upd as updates,
          n_tup_del as deletes,
          last_analyze as last_analyzed
        FROM pg_stat_user_tables 
        WHERE schemaname = 'public'
        ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
      `);

      return result.map((table: any) => ({
        name: table.name,
        size: table.size,
        rowCount: (table.inserts || 0) - (table.deletes || 0),
        lastAnalyzed: table.last_analyzed
          ? new Date(table.last_analyzed)
          : new Date(),
      }));
    } catch (error) {
      this.logger.error("Failed to get table statistics", error);
      return [];
    }
  }

  async getIndexUsage(): Promise<
    Array<{
      name: string;
      table: string;
      scans: number;
      tuplesRead: number;
      tuplesFetched: number;
    }>
  > {
    try {
      const result = await this.dataSource.query(`
        SELECT 
          indexrelname as name,
          relname as table,
          idx_scan as scans,
          idx_tup_read as tuples_read,
          idx_tup_fetch as tuples_fetched
        FROM pg_stat_user_indexes 
        ORDER BY idx_scan DESC
      `);

      return result.map((index: any) => ({
        name: index.name,
        table: index.table,
        scans: parseInt(index.scans || "0"),
        tuplesRead: parseInt(index.tuples_read || "0"),
        tuplesFetched: parseInt(index.tuples_fetched || "0"),
      }));
    } catch (error) {
      this.logger.error("Failed to get index usage", error);
      return [];
    }
  }

  clearQueryHistory(): void {
    this.queryPerformance = [];
    this.logger.log("Query performance history cleared");
  }
}
