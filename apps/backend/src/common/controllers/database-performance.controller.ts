import { Controller, Get, Post, Delete, Query, Param } from "@nestjs/common";
import {
  DatabasePerformanceMonitoringService,
  PerformanceMetrics,
  PerformanceAlert,
  PerformanceOptimization,
} from "../services/database-performance-monitoring.service";

@Controller("api/database/performance")
export class DatabasePerformanceController {
  constructor(
    private readonly performanceService: DatabasePerformanceMonitoringService
  ) {}

  @Get("metrics")
  async getPerformanceMetrics(): Promise<PerformanceMetrics> {
    return this.performanceService.getPerformanceMetrics();
  }

  @Get("summary")
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
    return this.performanceService.getPerformanceSummary();
  }

  @Get("alerts")
  getAlerts(
    @Query("type") type?: string,
    @Query("category") category?: string,
    @Query("limit") limit?: number
  ): PerformanceAlert[] {
    let alerts = this.performanceService.getAlerts();

    // Filter by type
    if (type) {
      alerts = alerts.filter((alert) => alert.type === type);
    }

    // Filter by category
    if (category) {
      alerts = alerts.filter((alert) => alert.category === category);
    }

    // Apply limit
    if (limit && limit > 0) {
      alerts = alerts.slice(0, limit);
    }

    return alerts;
  }

  @Get("alerts/:alertId")
  getAlert(@Param("alertId") alertId: string): PerformanceAlert | null {
    const alerts = this.performanceService.getAlerts();
    return alerts.find((alert) => alert.id === alertId) || null;
  }

  @Delete("alerts")
  clearAlerts(): { message: string } {
    this.performanceService.clearAlerts();
    return { message: "Performance alerts cleared successfully" };
  }

  @Get("optimizations")
  getOptimizations(
    @Query("type") type?: string,
    @Query("priority") priority?: string,
    @Query("limit") limit?: number
  ): PerformanceOptimization[] {
    let optimizations = this.performanceService.getOptimizations();

    // Filter by type
    if (type) {
      optimizations = optimizations.filter((opt) => opt.type === type);
    }

    // Filter by priority
    if (priority) {
      optimizations = optimizations.filter((opt) => opt.priority === priority);
    }

    // Apply limit
    if (limit && limit > 0) {
      optimizations = optimizations.slice(0, limit);
    }

    return optimizations;
  }

  @Get("optimizations/:optimizationId")
  getOptimization(
    @Param("optimizationId") optimizationId: string
  ): PerformanceOptimization | null {
    const optimizations = this.performanceService.getOptimizations();
    return optimizations.find((opt) => opt.id === optimizationId) || null;
  }

  @Delete("optimizations")
  clearOptimizations(): { message: string } {
    this.performanceService.clearOptimizations();
    return { message: "Performance optimizations cleared successfully" };
  }

  @Get("history")
  getPerformanceHistory(
    @Query("limit") limit?: number,
    @Query("from") from?: string,
    @Query("to") to?: string
  ): PerformanceMetrics[] {
    let history = this.performanceService.getPerformanceHistory();

    // Filter by date range
    if (from || to) {
      const fromDate = from ? new Date(from) : new Date(0);
      const toDate = to ? new Date(to) : new Date();

      history = history.filter((metrics) => {
        // Since we don't have timestamps in metrics, we'll use array position as proxy
        // In a real implementation, you'd want to add timestamps to metrics
        return true; // Simplified for now
      });
    }

    // Apply limit
    if (limit && limit > 0) {
      history = history.slice(-limit);
    }

    return history;
  }

  @Get("health")
  async getPerformanceHealth(): Promise<{
    status: "healthy" | "warning" | "critical";
    issues: string[];
    metrics: PerformanceMetrics;
    alerts: PerformanceAlert[];
  }> {
    const metrics = await this.performanceService.getPerformanceMetrics();
    const alerts = this.performanceService.getAlerts();
    const issues: string[] = [];

    // Check query performance
    if (metrics.queries.avgExecutionTime > 1000) {
      issues.push(
        `High average query time: ${metrics.queries.avgExecutionTime.toFixed(2)}ms`
      );
    }

    if (metrics.queries.slowQueries > 10) {
      issues.push(
        `High number of slow queries: ${metrics.queries.slowQueries}`
      );
    }

    // Check connection health
    if (metrics.connections.connectionUtilization > 80) {
      issues.push(
        `High connection utilization: ${metrics.connections.connectionUtilization.toFixed(2)}%`
      );
    }

    // Check cache health
    if (metrics.cache.hitRatio < 80) {
      issues.push(`Low cache hit ratio: ${metrics.cache.hitRatio.toFixed(2)}%`);
    }

    // Check lock health
    if (metrics.locks.activeLocks > 5) {
      issues.push(`High number of active locks: ${metrics.locks.activeLocks}`);
    }

    // Determine status
    let status: "healthy" | "warning" | "critical" = "healthy";
    if (issues.length > 0) {
      status = issues.some(
        (issue) =>
          issue.includes("High number of slow queries") ||
          issue.includes("High number of active locks")
      )
        ? "critical"
        : "warning";
    }

    return {
      status,
      issues,
      metrics,
      alerts,
    };
  }

  @Post("refresh")
  async refreshMetrics(): Promise<{
    message: string;
    metrics: PerformanceMetrics;
  }> {
    const metrics = await this.performanceService.getPerformanceMetrics();
    return {
      message: "Performance metrics refreshed successfully",
      metrics,
    };
  }

  @Get("trends")
  async getPerformanceTrends(): Promise<{
    avgQueryTime: {
      current: number;
      trend: "increasing" | "decreasing" | "stable";
      change: number;
    };
    connectionUtilization: {
      current: number;
      trend: "increasing" | "decreasing" | "stable";
      change: number;
    };
    cacheHitRatio: {
      current: number;
      trend: "increasing" | "decreasing" | "stable";
      change: number;
    };
  }> {
    const history = this.performanceService.getPerformanceHistory();

    if (history.length < 2) {
      const currentMetrics =
        await this.performanceService.getPerformanceMetrics();
      return {
        avgQueryTime: {
          current: currentMetrics.queries.avgExecutionTime,
          trend: "stable",
          change: 0,
        },
        connectionUtilization: {
          current: currentMetrics.connections.connectionUtilization,
          trend: "stable",
          change: 0,
        },
        cacheHitRatio: {
          current: currentMetrics.cache.hitRatio,
          trend: "stable",
          change: 0,
        },
      };
    }

    const recent = history.slice(-5);
    const older = history.slice(-10, -5);

    const calculateTrend = (recentValues: number[], olderValues: number[]) => {
      const recentAvg =
        recentValues.reduce((sum, val) => sum + val, 0) / recentValues.length;
      const olderAvg =
        olderValues.reduce((sum, val) => sum + val, 0) / olderValues.length;
      const change = recentAvg - olderAvg;

      if (Math.abs(change) < 0.1) return "stable";
      return change > 0 ? "increasing" : "decreasing";
    };

    const recentQueryTimes = recent.map((m) => m.queries.avgExecutionTime);
    const olderQueryTimes = older.map((m) => m.queries.avgExecutionTime);
    const recentConnections = recent.map(
      (m) => m.connections.connectionUtilization
    );
    const olderConnections = older.map(
      (m) => m.connections.connectionUtilization
    );
    const recentCache = recent.map((m) => m.cache.hitRatio);
    const olderCache = older.map((m) => m.cache.hitRatio);

    const currentMetrics =
      await this.performanceService.getPerformanceMetrics();

    return {
      avgQueryTime: {
        current: currentMetrics.queries.avgExecutionTime,
        trend: calculateTrend(recentQueryTimes, olderQueryTimes),
        change:
          recentQueryTimes[recentQueryTimes.length - 1] -
          olderQueryTimes[olderQueryTimes.length - 1],
      },
      connectionUtilization: {
        current: currentMetrics.connections.connectionUtilization,
        trend: calculateTrend(recentConnections, olderConnections),
        change:
          recentConnections[recentConnections.length - 1] -
          olderConnections[olderConnections.length - 1],
      },
      cacheHitRatio: {
        current: currentMetrics.cache.hitRatio,
        trend: calculateTrend(recentCache, olderCache),
        change:
          recentCache[recentCache.length - 1] -
          olderCache[olderCache.length - 1],
      },
    };
  }
}
