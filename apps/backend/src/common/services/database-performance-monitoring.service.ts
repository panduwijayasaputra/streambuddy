import { Injectable, Logger } from "@nestjs/common";
import { DataSource } from "typeorm";
import { ConfigService } from "@nestjs/config";

export interface PerformanceMetrics {
  queries: {
    totalExecuted: number;
    avgExecutionTime: number;
    slowQueries: number;
    slowQueryThreshold: number;
    queryTypes: {
      SELECT: number;
      INSERT: number;
      UPDATE: number;
      DELETE: number;
    };
  };
  connections: {
    active: number;
    idle: number;
    maxConnections: number;
    connectionUtilization: number;
    connectionWaitTime: number;
  };
  cache: {
    hitRatio: number;
    bufferHitRatio: number;
    sharedBufferSize: string;
    effectiveCacheSize: string;
  };
  locks: {
    activeLocks: number;
    lockWaitTime: number;
    deadlocks: number;
    lockUtilization: number;
  };
  storage: {
    databaseSize: string;
    tableSizes: Array<{
      name: string;
      size: string;
      rowCount: number;
      indexSize: string;
    }>;
    indexUsage: Array<{
      name: string;
      table: string;
      scans: number;
      tuplesRead: number;
      tuplesFetched: number;
      usageRatio: number;
    }>;
  };
  performance: {
    tps: number; // Transactions per second
    qps: number; // Queries per second
    uptime: number;
    checkpointTime: number;
    vacuumTime: number;
  };
}

export interface PerformanceAlert {
  id: string;
  type: "warning" | "critical" | "info";
  category:
    | "query"
    | "connection"
    | "cache"
    | "lock"
    | "storage"
    | "performance";
  message: string;
  timestamp: Date;
  metrics: any;
  recommendations: string[];
}

export interface PerformanceOptimization {
  id: string;
  type: "index" | "query" | "connection" | "cache" | "maintenance";
  priority: "low" | "medium" | "high" | "critical";
  title: string;
  description: string;
  impact: string;
  effort: string;
  sql?: string;
  estimatedImprovement: number; // percentage
}

@Injectable()
export class DatabasePerformanceMonitoringService {
  private readonly logger = new Logger(
    DatabasePerformanceMonitoringService.name
  );
  private alerts: PerformanceAlert[] = [];
  private optimizations: PerformanceOptimization[] = [];
  private performanceHistory: PerformanceMetrics[] = [];
  private readonly maxHistorySize = 1000;

  constructor(
    private readonly dataSource: DataSource,
    private readonly configService: ConfigService
  ) {}

  async getPerformanceMetrics(): Promise<PerformanceMetrics> {
    try {
      const [queries, connections, cache, locks, storage, performance] =
        await Promise.all([
          this.getQueryMetrics(),
          this.getConnectionMetrics(),
          this.getCacheMetrics(),
          this.getLockMetrics(),
          this.getStorageMetrics(),
          this.getPerformanceIndicators(),
        ]);

      const metrics: PerformanceMetrics = {
        queries,
        connections,
        cache,
        locks,
        storage,
        performance,
      };

      // Store in history
      this.performanceHistory.push(metrics);
      if (this.performanceHistory.length > this.maxHistorySize) {
        this.performanceHistory.shift();
      }

      // Check for alerts
      await this.checkPerformanceAlerts(metrics);

      // Generate optimization recommendations
      await this.generateOptimizations(metrics);

      return metrics;
    } catch (error) {
      this.logger.error("Failed to get performance metrics", error);
      throw error;
    }
  }

  private async getQueryMetrics() {
    try {
      // Get query statistics from PostgreSQL
      const queryStats = await this.dataSource.query(`
        SELECT 
          sum(calls) as total_calls,
          avg(mean_exec_time) as avg_exec_time,
          sum(calls * mean_exec_time) / sum(calls) as weighted_avg_time
        FROM pg_stat_statements
      `);

      const slowQueryThreshold = this.configService.get<number>(
        "DB_SLOW_QUERY_THRESHOLD",
        1000
      );

      const slowQueries = await this.dataSource.query(
        `
        SELECT count(*) as count
        FROM pg_stat_statements
        WHERE mean_exec_time > $1
      `,
        [slowQueryThreshold]
      );

      // Get query type distribution
      const queryTypes = await this.dataSource.query(`
        SELECT 
          CASE 
            WHEN query LIKE 'SELECT%' THEN 'SELECT'
            WHEN query LIKE 'INSERT%' THEN 'INSERT'
            WHEN query LIKE 'UPDATE%' THEN 'UPDATE'
            WHEN query LIKE 'DELETE%' THEN 'DELETE'
            ELSE 'OTHER'
          END as query_type,
          count(*) as count
        FROM pg_stat_statements
        GROUP BY query_type
      `);

      const queryTypeMap = {
        SELECT: 0,
        INSERT: 0,
        UPDATE: 0,
        DELETE: 0,
      };

      queryTypes.forEach((type: any) => {
        if (queryTypeMap.hasOwnProperty(type.query_type)) {
          queryTypeMap[type.query_type as keyof typeof queryTypeMap] = parseInt(
            type.count
          );
        }
      });

      return {
        totalExecuted: parseInt(queryStats[0]?.total_calls || "0"),
        avgExecutionTime: parseFloat(queryStats[0]?.weighted_avg_time || "0"),
        slowQueries: parseInt(slowQueries[0]?.count || "0"),
        slowQueryThreshold,
        queryTypes: queryTypeMap,
      };
    } catch (error) {
      this.logger.error("Failed to get query metrics", error);
      return {
        totalExecuted: 0,
        avgExecutionTime: 0,
        slowQueries: 0,
        slowQueryThreshold: 1000,
        queryTypes: { SELECT: 0, INSERT: 0, UPDATE: 0, DELETE: 0 },
      };
    }
  }

  private async getConnectionMetrics() {
    try {
      const pool = (this.dataSource.driver as any).pool;

      if (!pool) {
        return {
          active: 0,
          idle: 0,
          maxConnections: 0,
          connectionUtilization: 0,
          connectionWaitTime: 0,
        };
      }

      const active = pool.usedCount || 0;
      const idle = pool.freeCount || 0;
      const maxConnections = pool.totalCount || 0;
      const connectionUtilization =
        maxConnections > 0 ? (active / maxConnections) * 100 : 0;

      // Get connection wait time from PostgreSQL
      const waitTimeResult = await this.dataSource.query(`
        SELECT COALESCE(avg(wait_time), 0) as avg_wait_time
        FROM pg_stat_activity
        WHERE state = 'active'
      `);

      return {
        active,
        idle,
        maxConnections,
        connectionUtilization,
        connectionWaitTime: parseFloat(waitTimeResult[0]?.avg_wait_time || "0"),
      };
    } catch (error) {
      this.logger.error("Failed to get connection metrics", error);
      return {
        active: 0,
        idle: 0,
        maxConnections: 0,
        connectionUtilization: 0,
        connectionWaitTime: 0,
      };
    }
  }

  private async getCacheMetrics() {
    try {
      // Get buffer cache hit ratio
      const bufferHitRatio = await this.dataSource.query(`
        SELECT 
          sum(heap_blks_hit) as hits,
          sum(heap_blks_read) as reads
        FROM pg_statio_user_tables
      `);

      const hits = parseInt(bufferHitRatio[0]?.hits || "0");
      const reads = parseInt(bufferHitRatio[0]?.reads || "0");
      const bufferHitRatioPercent =
        hits + reads > 0 ? (hits / (hits + reads)) * 100 : 0;

      // Get shared buffer size
      const sharedBufferSize = await this.dataSource.query(`
        SELECT setting as size FROM pg_settings WHERE name = 'shared_buffers'
      `);

      // Get effective cache size
      const effectiveCacheSize = await this.dataSource.query(`
        SELECT setting as size FROM pg_settings WHERE name = 'effective_cache_size'
      `);

      return {
        hitRatio: bufferHitRatioPercent,
        bufferHitRatio: bufferHitRatioPercent,
        sharedBufferSize: sharedBufferSize[0]?.size || "0",
        effectiveCacheSize: effectiveCacheSize[0]?.size || "0",
      };
    } catch (error) {
      this.logger.error("Failed to get cache metrics", error);
      return {
        hitRatio: 0,
        bufferHitRatio: 0,
        sharedBufferSize: "0",
        effectiveCacheSize: "0",
      };
    }
  }

  private async getLockMetrics() {
    try {
      // Get active locks
      const activeLocks = await this.dataSource.query(`
        SELECT count(*) as count
        FROM pg_locks
        WHERE NOT granted
      `);

      // Get lock wait time
      const lockWaitTime = await this.dataSource.query(`
        SELECT COALESCE(avg(EXTRACT(EPOCH FROM (now() - query_start))), 0) as avg_wait_time
        FROM pg_stat_activity
        WHERE state = 'active' AND wait_event_type = 'Lock'
      `);

      // Get deadlocks
      const deadlocks = await this.dataSource.query(`
        SELECT deadlocks FROM pg_stat_database WHERE datname = current_database()
      `);

      // Get lock utilization
      const lockUtilization = await this.dataSource.query(`
        SELECT 
          count(*) as total_locks,
          count(*) FILTER (WHERE NOT granted) as waiting_locks
        FROM pg_locks
      `);

      const totalLocks = parseInt(lockUtilization[0]?.total_locks || "0");
      const waitingLocks = parseInt(lockUtilization[0]?.waiting_locks || "0");
      const lockUtilizationPercent =
        totalLocks > 0 ? (waitingLocks / totalLocks) * 100 : 0;

      return {
        activeLocks: parseInt(activeLocks[0]?.count || "0"),
        lockWaitTime: parseFloat(lockWaitTime[0]?.avg_wait_time || "0"),
        deadlocks: parseInt(deadlocks[0]?.deadlocks || "0"),
        lockUtilization: lockUtilizationPercent,
      };
    } catch (error) {
      this.logger.error("Failed to get lock metrics", error);
      return {
        activeLocks: 0,
        lockWaitTime: 0,
        deadlocks: 0,
        lockUtilization: 0,
      };
    }
  }

  private async getStorageMetrics() {
    try {
      // Get database size
      const dbSize = await this.dataSource.query(`
        SELECT pg_size_pretty(pg_database_size(current_database())) as size
      `);

      // Get table sizes with row counts
      const tableSizes = await this.dataSource.query(`
        SELECT 
          schemaname,
          tablename as name,
          pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size,
          pg_total_relation_size(schemaname||'.'||tablename) as size_bytes,
          (SELECT reltuples FROM pg_class WHERE relname = tablename) as row_count
        FROM pg_tables 
        WHERE schemaname = 'public'
        ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
        LIMIT 20
      `);

      // Get index usage statistics
      const indexUsage = await this.dataSource.query(`
        SELECT 
          indexrelname as name,
          relname as table,
          idx_scan as scans,
          idx_tup_read as tuples_read,
          idx_tup_fetch as tuples_fetched,
          CASE 
            WHEN idx_scan > 0 THEN (idx_tup_fetch::float / idx_scan)
            ELSE 0 
          END as usage_ratio
        FROM pg_stat_user_indexes
        ORDER BY idx_scan DESC
        LIMIT 20
      `);

      return {
        databaseSize: dbSize[0]?.size || "0 MB",
        tableSizes: tableSizes.map((table: any) => ({
          name: table.name,
          size: table.size,
          rowCount: parseInt(table.row_count || "0"),
          indexSize: "0", // Would need additional query
        })),
        indexUsage: indexUsage.map((index: any) => ({
          name: index.name,
          table: index.table,
          scans: parseInt(index.scans || "0"),
          tuplesRead: parseInt(index.tuples_read || "0"),
          tuplesFetched: parseInt(index.tuples_fetched || "0"),
          usageRatio: parseFloat(index.usage_ratio || "0"),
        })),
      };
    } catch (error) {
      this.logger.error("Failed to get storage metrics", error);
      return {
        databaseSize: "0 MB",
        tableSizes: [],
        indexUsage: [],
      };
    }
  }

  private async getPerformanceIndicators() {
    try {
      // Get transactions per second
      const tpsResult = await this.dataSource.query(`
        SELECT 
          xact_commit + xact_rollback as total_transactions,
          EXTRACT(EPOCH FROM (now() - stats_reset)) as uptime_seconds
        FROM pg_stat_database 
        WHERE datname = current_database()
      `);

      const totalTransactions = parseInt(
        tpsResult[0]?.total_transactions || "0"
      );
      const uptimeSeconds = parseFloat(tpsResult[0]?.uptime_seconds || "1");
      const tps = uptimeSeconds > 0 ? totalTransactions / uptimeSeconds : 0;

      // Get queries per second
      const qpsResult = await this.dataSource.query(`
        SELECT 
          sum(calls) as total_calls,
          EXTRACT(EPOCH FROM (now() - stats_reset)) as uptime_seconds
        FROM pg_stat_statements
      `);

      const totalCalls = parseInt(qpsResult[0]?.total_calls || "0");
      const qps = uptimeSeconds > 0 ? totalCalls / uptimeSeconds : 0;

      // Get checkpoint and vacuum times
      const maintenanceResult = await this.dataSource.query(`
        SELECT 
          checkpoints_timed + checkpoints_req as total_checkpoints,
          checkpoint_write_time as checkpoint_time,
          vacuum_count,
          vacuum_time
        FROM pg_stat_bgwriter
      `);

      return {
        tps,
        qps,
        uptime: uptimeSeconds,
        checkpointTime: parseFloat(
          maintenanceResult[0]?.checkpoint_time || "0"
        ),
        vacuumTime: parseFloat(maintenanceResult[0]?.vacuum_time || "0"),
      };
    } catch (error) {
      this.logger.error("Failed to get performance metrics", error);
      return {
        tps: 0,
        qps: 0,
        uptime: 0,
        checkpointTime: 0,
        vacuumTime: 0,
      };
    }
  }

  private async checkPerformanceAlerts(metrics: PerformanceMetrics) {
    const alerts: PerformanceAlert[] = [];

    // Query performance alerts
    if (metrics.queries.avgExecutionTime > 1000) {
      alerts.push({
        id: this.generateAlertId(),
        type: "warning",
        category: "query",
        message: `High average query execution time: ${metrics.queries.avgExecutionTime.toFixed(2)}ms`,
        timestamp: new Date(),
        metrics: metrics.queries,
        recommendations: [
          "Review slow queries and optimize them",
          "Add appropriate indexes",
          "Consider query caching",
        ],
      });
    }

    if (metrics.queries.slowQueries > 10) {
      alerts.push({
        id: this.generateAlertId(),
        type: "critical",
        category: "query",
        message: `High number of slow queries: ${metrics.queries.slowQueries}`,
        timestamp: new Date(),
        metrics: metrics.queries,
        recommendations: [
          "Identify and optimize slow queries",
          "Add missing indexes",
          "Consider query rewriting",
        ],
      });
    }

    // Connection alerts
    if (metrics.connections.connectionUtilization > 80) {
      alerts.push({
        id: this.generateAlertId(),
        type: "warning",
        category: "connection",
        message: `High connection pool utilization: ${metrics.connections.connectionUtilization.toFixed(2)}%`,
        timestamp: new Date(),
        metrics: metrics.connections,
        recommendations: [
          "Increase connection pool size",
          "Optimize connection usage",
          "Consider connection pooling",
        ],
      });
    }

    // Cache alerts
    if (metrics.cache.hitRatio < 80) {
      alerts.push({
        id: this.generateAlertId(),
        type: "warning",
        category: "cache",
        message: `Low cache hit ratio: ${metrics.cache.hitRatio.toFixed(2)}%`,
        timestamp: new Date(),
        metrics: metrics.cache,
        recommendations: [
          "Increase shared_buffers",
          "Optimize query patterns",
          "Add appropriate indexes",
        ],
      });
    }

    // Lock alerts
    if (metrics.locks.activeLocks > 5) {
      alerts.push({
        id: this.generateAlertId(),
        type: "critical",
        category: "lock",
        message: `High number of active locks: ${metrics.locks.activeLocks}`,
        timestamp: new Date(),
        metrics: metrics.locks,
        recommendations: [
          "Review transaction patterns",
          "Reduce transaction duration",
          "Use appropriate isolation levels",
        ],
      });
    }

    // Add new alerts
    this.alerts.push(...alerts);

    // Keep only recent alerts
    const maxAlerts = 100;
    if (this.alerts.length > maxAlerts) {
      this.alerts = this.alerts.slice(-maxAlerts);
    }
  }

  private async generateOptimizations(metrics: PerformanceMetrics) {
    const optimizations: PerformanceOptimization[] = [];

    // Index optimizations
    const unusedIndexes = metrics.storage.indexUsage.filter(
      (index) => index.scans === 0
    );
    if (unusedIndexes.length > 0) {
      optimizations.push({
        id: this.generateOptimizationId(),
        type: "index",
        priority: "medium",
        title: "Remove Unused Indexes",
        description: `Found ${unusedIndexes.length} unused indexes that can be removed`,
        impact: "Reduce storage and maintenance overhead",
        effort: "Low",
        estimatedImprovement: 5,
      });
    }

    // Query optimizations
    if (metrics.queries.avgExecutionTime > 500) {
      optimizations.push({
        id: this.generateOptimizationId(),
        type: "query",
        priority: "high",
        title: "Optimize Slow Queries",
        description: "Average query execution time is high",
        impact: "Significantly improve response times",
        effort: "Medium",
        estimatedImprovement: 30,
      });
    }

    // Connection optimizations
    if (metrics.connections.connectionUtilization > 70) {
      optimizations.push({
        id: this.generateOptimizationId(),
        type: "connection",
        priority: "medium",
        title: "Optimize Connection Pool",
        description: "Connection pool utilization is high",
        impact: "Improve connection availability",
        effort: "Low",
        estimatedImprovement: 15,
      });
    }

    // Cache optimizations
    if (metrics.cache.hitRatio < 85) {
      optimizations.push({
        id: this.generateOptimizationId(),
        type: "cache",
        priority: "high",
        title: "Optimize Cache Configuration",
        description: "Cache hit ratio is below optimal levels",
        impact: "Improve query performance",
        effort: "Medium",
        estimatedImprovement: 25,
      });
    }

    // Maintenance optimizations
    if (metrics.performance.vacuumTime > 1000) {
      optimizations.push({
        id: this.generateOptimizationId(),
        type: "maintenance",
        priority: "low",
        title: "Schedule Regular Maintenance",
        description: "Vacuum operations are taking long",
        impact: "Improve maintenance efficiency",
        effort: "Low",
        estimatedImprovement: 10,
      });
    }

    this.optimizations = optimizations;
  }

  private generateAlertId(): string {
    return `alert-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  private generateOptimizationId(): string {
    return `opt-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  getAlerts(): PerformanceAlert[] {
    return [...this.alerts];
  }

  getOptimizations(): PerformanceOptimization[] {
    return [...this.optimizations];
  }

  getPerformanceHistory(): PerformanceMetrics[] {
    return [...this.performanceHistory];
  }

  clearAlerts(): void {
    this.alerts = [];
    this.logger.log("Performance alerts cleared");
  }

  clearOptimizations(): void {
    this.optimizations = [];
    this.logger.log("Performance optimizations cleared");
  }

  async getPerformanceSummary(): Promise<{
    currentMetrics: PerformanceMetrics;
    alerts: PerformanceAlert[];
    optimizations: PerformanceOptimization[];
    trends: {
      avgQueryTime: number;
      connectionUtilization: number;
      cacheHitRatio: number;
    };
  }> {
    const currentMetrics = await this.getPerformanceMetrics();
    const alerts = this.getAlerts();
    const optimizations = this.getOptimizations();

    // Calculate trends from history
    const recentMetrics = this.performanceHistory.slice(-10);
    const trends = {
      avgQueryTime:
        recentMetrics.length > 0
          ? recentMetrics.reduce(
              (sum, m) => sum + m.queries.avgExecutionTime,
              0
            ) / recentMetrics.length
          : 0,
      connectionUtilization:
        recentMetrics.length > 0
          ? recentMetrics.reduce(
              (sum, m) => sum + m.connections.connectionUtilization,
              0
            ) / recentMetrics.length
          : 0,
      cacheHitRatio:
        recentMetrics.length > 0
          ? recentMetrics.reduce((sum, m) => sum + m.cache.hitRatio, 0) /
            recentMetrics.length
          : 0,
    };

    return {
      currentMetrics,
      alerts,
      optimizations,
      trends,
    };
  }
}
