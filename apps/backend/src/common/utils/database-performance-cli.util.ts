#!/usr/bin/env node

import { NestFactory } from "@nestjs/core";
import { AppModule } from "../../app.module";
import { DatabasePerformanceMonitoringService } from "../services/database-performance-monitoring.service";

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const performanceService = app.get(DatabasePerformanceMonitoringService);

  const command = process.argv[2];
  const args = process.argv.slice(3);

  try {
    switch (command) {
      case "metrics":
        await handleMetricsCommand(performanceService, args);
        break;
      case "alerts":
        await handleAlertsCommand(performanceService, args);
        break;
      case "optimizations":
        await handleOptimizationsCommand(performanceService, args);
        break;
      case "health":
        await handleHealthCommand(performanceService);
        break;
      case "trends":
        await handleTrendsCommand(performanceService);
        break;
      case "summary":
        await handleSummaryCommand(performanceService);
        break;
      case "history":
        await handleHistoryCommand(performanceService, args);
        break;
      default:
        printUsage();
    }
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  } finally {
    await app.close();
  }
}

async function handleMetricsCommand(
  performanceService: DatabasePerformanceMonitoringService,
  args: string[]
) {
  const metrics = await performanceService.getPerformanceMetrics();

  if (args.length === 0) {
    console.log("Database Performance Metrics:");
    console.log(JSON.stringify(metrics, null, 2));
    return;
  }

  const subCommand = args[0];
  switch (subCommand) {
    case "queries":
      console.log("Query Performance:");
      console.log(JSON.stringify(metrics.queries, null, 2));
      break;
    case "connections":
      console.log("Connection Metrics:");
      console.log(JSON.stringify(metrics.connections, null, 2));
      break;
    case "cache":
      console.log("Cache Metrics:");
      console.log(JSON.stringify(metrics.cache, null, 2));
      break;
    case "locks":
      console.log("Lock Metrics:");
      console.log(JSON.stringify(metrics.locks, null, 2));
      break;
    case "storage":
      console.log("Storage Metrics:");
      console.log(JSON.stringify(metrics.storage, null, 2));
      break;
    case "performance":
      console.log("Performance Metrics:");
      console.log(JSON.stringify(metrics.performance, null, 2));
      break;
    default:
      console.error("Unknown metrics subcommand:", subCommand);
  }
}

async function handleAlertsCommand(
  performanceService: DatabasePerformanceMonitoringService,
  args: string[]
) {
  if (args.length === 0) {
    const alerts = performanceService.getAlerts();
    console.log("Performance Alerts:");
    alerts.forEach((alert) => {
      console.log(
        `[${alert.type.toUpperCase()}] ${alert.category}: ${alert.message}`
      );
    });
    return;
  }

  const subCommand = args[0];
  switch (subCommand) {
    case "clear":
      performanceService.clearAlerts();
      console.log("Performance alerts cleared");
      break;
    case "details":
      if (args.length < 2) {
        console.error("Usage: alerts details <alertId>");
        return;
      }
      const alertId = args[1];
      const alerts = performanceService.getAlerts();
      const alert = alerts.find((a) => a.id === alertId);
      if (alert) {
        console.log("Alert details:");
        console.log(JSON.stringify(alert, null, 2));
      } else {
        console.error("Alert not found:", alertId);
      }
      break;
    default:
      console.error("Unknown alerts subcommand:", subCommand);
  }
}

async function handleOptimizationsCommand(
  performanceService: DatabasePerformanceMonitoringService,
  args: string[]
) {
  if (args.length === 0) {
    const optimizations = performanceService.getOptimizations();
    console.log("Performance Optimizations:");
    optimizations.forEach((opt) => {
      console.log(`[${opt.priority.toUpperCase()}] ${opt.type}: ${opt.title}`);
      console.log(
        `  Impact: ${opt.impact} (${opt.estimatedImprovement}% improvement)`
      );
    });
    return;
  }

  const subCommand = args[0];
  switch (subCommand) {
    case "clear":
      performanceService.clearOptimizations();
      console.log("Performance optimizations cleared");
      break;
    case "details":
      if (args.length < 2) {
        console.error("Usage: optimizations details <optimizationId>");
        return;
      }
      const optimizationId = args[1];
      const optimizations = performanceService.getOptimizations();
      const optimization = optimizations.find((o) => o.id === optimizationId);
      if (optimization) {
        console.log("Optimization details:");
        console.log(JSON.stringify(optimization, null, 2));
      } else {
        console.error("Optimization not found:", optimizationId);
      }
      break;
    default:
      console.error("Unknown optimizations subcommand:", subCommand);
  }
}

async function handleHealthCommand(
  performanceService: DatabasePerformanceMonitoringService
) {
  const metrics = await performanceService.getPerformanceMetrics();
  const alerts = performanceService.getAlerts();

  console.log("Database Performance Health:");
  console.log(
    `- Average Query Time: ${metrics.queries.avgExecutionTime.toFixed(2)}ms`
  );
  console.log(
    `- Connection Utilization: ${metrics.connections.connectionUtilization.toFixed(2)}%`
  );
  console.log(`- Cache Hit Ratio: ${metrics.cache.hitRatio.toFixed(2)}%`);
  console.log(`- Active Locks: ${metrics.locks.activeLocks}`);
  console.log(`- Active Alerts: ${alerts.length}`);

  const criticalAlerts = alerts.filter((a) => a.type === "critical");
  const warningAlerts = alerts.filter((a) => a.type === "warning");

  if (criticalAlerts.length > 0) {
    console.log(`\nCritical Issues: ${criticalAlerts.length}`);
    criticalAlerts.forEach((alert) => {
      console.log(`  - ${alert.message}`);
    });
  }

  if (warningAlerts.length > 0) {
    console.log(`\nWarnings: ${warningAlerts.length}`);
    warningAlerts.forEach((alert) => {
      console.log(`  - ${alert.message}`);
    });
  }
}

async function handleTrendsCommand(
  performanceService: DatabasePerformanceMonitoringService
) {
  const history = performanceService.getPerformanceHistory();

  if (history.length < 2) {
    console.log("Insufficient history data for trend analysis");
    return;
  }

  const recent = history.slice(-5);
  const older = history.slice(-10, -5);

  console.log("Performance Trends:");

  // Query time trend
  const recentQueryTimes = recent.map((m) => m.queries.avgExecutionTime);
  const olderQueryTimes = older.map((m) => m.queries.avgExecutionTime);
  const queryTimeChange =
    recentQueryTimes[recentQueryTimes.length - 1] -
    olderQueryTimes[olderQueryTimes.length - 1];
  console.log(
    `- Query Time: ${queryTimeChange > 0 ? "↗" : "↘"} ${Math.abs(queryTimeChange).toFixed(2)}ms change`
  );

  // Connection utilization trend
  const recentConnections = recent.map(
    (m) => m.connections.connectionUtilization
  );
  const olderConnections = older.map(
    (m) => m.connections.connectionUtilization
  );
  const connectionChange =
    recentConnections[recentConnections.length - 1] -
    olderConnections[olderConnections.length - 1];
  console.log(
    `- Connection Utilization: ${connectionChange > 0 ? "↗" : "↘"} ${Math.abs(connectionChange).toFixed(2)}% change`
  );

  // Cache hit ratio trend
  const recentCache = recent.map((m) => m.cache.hitRatio);
  const olderCache = older.map((m) => m.cache.hitRatio);
  const cacheChange =
    recentCache[recentCache.length - 1] - olderCache[olderCache.length - 1];
  console.log(
    `- Cache Hit Ratio: ${cacheChange > 0 ? "↗" : "↘"} ${Math.abs(cacheChange).toFixed(2)}% change`
  );
}

async function handleSummaryCommand(
  performanceService: DatabasePerformanceMonitoringService
) {
  const summary = await performanceService.getPerformanceSummary();

  console.log("Database Performance Summary:");
  console.log("\nCurrent Metrics:");
  console.log(
    `- Queries: ${summary.currentMetrics.queries.totalExecuted} executed, ${summary.currentMetrics.queries.avgExecutionTime.toFixed(2)}ms avg`
  );
  console.log(
    `- Connections: ${summary.currentMetrics.connections.active}/${summary.currentMetrics.connections.maxConnections} active`
  );
  console.log(
    `- Cache: ${summary.currentMetrics.cache.hitRatio.toFixed(2)}% hit ratio`
  );
  console.log(
    `- Locks: ${summary.currentMetrics.locks.activeLocks} active locks`
  );

  console.log("\nAlerts:");
  summary.alerts.forEach((alert) => {
    console.log(`- [${alert.type.toUpperCase()}] ${alert.message}`);
  });

  console.log("\nOptimizations:");
  summary.optimizations.forEach((opt) => {
    console.log(
      `- [${opt.priority.toUpperCase()}] ${opt.title} (${opt.estimatedImprovement}% improvement)`
    );
  });

  console.log("\nTrends:");
  console.log(
    `- Query Time: ${summary.trends.avgQueryTime.toFixed(2)}ms average`
  );
  console.log(
    `- Connection Utilization: ${summary.trends.connectionUtilization.toFixed(2)}% average`
  );
  console.log(
    `- Cache Hit Ratio: ${summary.trends.cacheHitRatio.toFixed(2)}% average`
  );
}

async function handleHistoryCommand(
  performanceService: DatabasePerformanceMonitoringService,
  args: string[]
) {
  const history = performanceService.getPerformanceHistory();

  if (args.length === 0) {
    console.log("Performance History (last 10 entries):");
    history.slice(-10).forEach((metrics, index) => {
      console.log(
        `${index + 1}. Query Time: ${metrics.queries.avgExecutionTime.toFixed(2)}ms, Connections: ${metrics.connections.connectionUtilization.toFixed(2)}%, Cache: ${metrics.cache.hitRatio.toFixed(2)}%`
      );
    });
    return;
  }

  const limit = parseInt(args[0]);
  if (isNaN(limit)) {
    console.error("Invalid limit. Please provide a number.");
    return;
  }

  console.log(`Performance History (last ${limit} entries):`);
  history.slice(-limit).forEach((metrics, index) => {
    console.log(
      `${index + 1}. Query Time: ${metrics.queries.avgExecutionTime.toFixed(2)}ms, Connections: ${metrics.connections.connectionUtilization.toFixed(2)}%, Cache: ${metrics.cache.hitRatio.toFixed(2)}%`
    );
  });
}

function printUsage() {
  console.log(`
Database Performance Monitoring CLI

Usage: npm run db:performance <command> [args]

Commands:
  metrics                    Show all performance metrics
  metrics <category>         Show specific metrics (queries, connections, cache, locks, storage, performance)
  alerts                     Show performance alerts
  alerts clear               Clear all alerts
  alerts details <alertId>   Show alert details
  optimizations              Show performance optimizations
  optimizations clear        Clear all optimizations
  optimizations details <id> Show optimization details
  health                     Show performance health status
  trends                     Show performance trends
  summary                    Show performance summary
  history [limit]            Show performance history

Examples:
  npm run db:performance metrics
  npm run db:performance metrics queries
  npm run db:performance alerts
  npm run db:performance health
  npm run db:performance trends
  npm run db:performance summary
  npm run db:performance history 20
`);
}

if (require.main === module) {
  bootstrap();
}
