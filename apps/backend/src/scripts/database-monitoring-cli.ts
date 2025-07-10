#!/usr/bin/env ts-node

import { NestFactory } from "@nestjs/core";
import { AppModule } from "../app.module";
import { DatabaseMonitoringService } from "../common/services/database-monitoring.service";

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const monitoringService = app.get(DatabaseMonitoringService);

  const command = process.argv[2];
  const args = process.argv.slice(3);

  try {
    switch (command) {
      case "metrics":
        console.log("📊 Database Metrics:");
        const metrics = await monitoringService.getDatabaseMetrics();
        console.log(JSON.stringify(metrics, null, 2));
        break;

      case "health":
        console.log("🏥 Database Health Check:");
        const health = await monitoringService.getDatabaseMetrics();
        console.log(`Status: ${health.health.status}`);
        console.log(`Issues: ${health.health.issues.length}`);
        console.log(`Recommendations: ${health.health.recommendations.length}`);

        if (health.health.issues.length > 0) {
          console.log("\nIssues:");
          health.health.issues.forEach((issue) => console.log(`- ${issue}`));
        }

        if (health.health.recommendations.length > 0) {
          console.log("\nRecommendations:");
          health.health.recommendations.forEach((rec) =>
            console.log(`- ${rec}`)
          );
        }
        break;

      case "performance":
        console.log("⚡ Performance Summary:");
        const perf = await monitoringService.getDatabaseMetrics();
        console.log(
          `Average Query Time: ${perf.performance.avgQueryTime.toFixed(2)}ms`
        );
        console.log(`Slow Queries: ${perf.performance.slowQueries}`);
        console.log(`Total Queries: ${perf.performance.totalQueries}`);
        console.log(
          `Cache Hit Ratio: ${perf.performance.cacheHitRatio.toFixed(2)}%`
        );
        break;

      case "pool":
        console.log("🏊 Connection Pool Status:");
        const pool = await monitoringService.getDatabaseMetrics();
        console.log(`Total Connections: ${pool.connectionPool.total}`);
        console.log(`Active Connections: ${pool.connectionPool.active}`);
        console.log(`Idle Connections: ${pool.connectionPool.idle}`);
        console.log(`Waiting Connections: ${pool.connectionPool.waiting}`);

        const utilization =
          pool.connectionPool.total > 0
            ? (pool.connectionPool.active / pool.connectionPool.total) * 100
            : 0;
        console.log(`Utilization: ${utilization.toFixed(2)}%`);
        break;

      case "storage":
        console.log("💾 Storage Information:");
        const storage = await monitoringService.getDatabaseMetrics();
        console.log(`Database Size: ${storage.storage.databaseSize}`);
        console.log(`Table Count: ${storage.storage.tableCount}`);
        console.log(`Index Count: ${storage.storage.indexCount}`);

        if (storage.storage.largestTables.length > 0) {
          console.log("\nLargest Tables:");
          storage.storage.largestTables.forEach((table) => {
            console.log(`- ${table.name}: ${table.size}`);
          });
        }
        break;

      case "tables":
        console.log("📋 Table Statistics:");
        const tables = await monitoringService.getTableStatistics();
        if (tables.length === 0) {
          console.log("No tables found");
        } else {
          console.log("Tables:");
          tables.forEach((table) => {
            console.log(
              `- ${table.name}: ${table.size} (${table.rowCount} rows)`
            );
          });
        }
        break;

      case "indexes":
        console.log("🔍 Index Usage:");
        const indexes = await monitoringService.getIndexUsage();
        if (indexes.length === 0) {
          console.log("No indexes found");
        } else {
          console.log("Indexes:");
          indexes.forEach((index) => {
            console.log(
              `- ${index.name} (${index.table}): ${index.scans} scans`
            );
          });
        }
        break;

      case "queries":
        console.log("📝 Query Performance History:");
        const queries = monitoringService.getQueryPerformanceHistory();
        if (queries.length === 0) {
          console.log("No query history available");
        } else {
          console.log(`Total Queries: ${queries.length}`);
          console.log(`Slow Queries: ${queries.filter((q) => q.slow).length}`);

          const recentQueries = queries.slice(-10);
          console.log("\nRecent Queries:");
          recentQueries.forEach((query) => {
            const status = query.slow ? "🐌" : "⚡";
            console.log(
              `${status} ${query.executionTime}ms - ${query.query.substring(0, 50)}...`
            );
          });
        }
        break;

      case "slow-queries":
        console.log("🐌 Slow Queries:");
        const slowQueries = monitoringService.getSlowQueries();
        if (slowQueries.length === 0) {
          console.log("No slow queries detected");
        } else {
          console.log(`Found ${slowQueries.length} slow queries:`);
          slowQueries.forEach((query) => {
            console.log(`- ${query.executionTime}ms: ${query.query}`);
          });
        }
        break;

      case "clear-history":
        console.log("🧹 Clearing query history...");
        monitoringService.clearQueryHistory();
        console.log("Query history cleared successfully");
        break;

      case "summary":
        console.log("📊 Database Monitoring Summary:");
        const summary = await monitoringService.getDatabaseMetrics();

        console.log("\n🏥 Health:");
        console.log(`Status: ${summary.health.status}`);
        console.log(`Issues: ${summary.health.issues.length}`);

        console.log("\n🏊 Connection Pool:");
        console.log(`Total: ${summary.connectionPool.total}`);
        console.log(`Active: ${summary.connectionPool.active}`);
        console.log(`Idle: ${summary.connectionPool.idle}`);

        console.log("\n⚡ Performance:");
        console.log(
          `Avg Query Time: ${summary.performance.avgQueryTime.toFixed(2)}ms`
        );
        console.log(`Slow Queries: ${summary.performance.slowQueries}`);
        console.log(
          `Cache Hit Ratio: ${summary.performance.cacheHitRatio.toFixed(2)}%`
        );

        console.log("\n💾 Storage:");
        console.log(`Database Size: ${summary.storage.databaseSize}`);
        console.log(`Tables: ${summary.storage.tableCount}`);
        console.log(`Indexes: ${summary.storage.indexCount}`);
        break;

      default:
        console.log("Usage:");
        console.log(
          "  metrics                    - Get detailed database metrics"
        );
        console.log(
          "  health                     - Check database health status"
        );
        console.log("  performance                - Show performance summary");
        console.log(
          "  pool                       - Show connection pool status"
        );
        console.log("  storage                    - Show storage information");
        console.log("  tables                     - Show table statistics");
        console.log("  indexes                    - Show index usage");
        console.log(
          "  queries                    - Show query performance history"
        );
        console.log("  slow-queries               - Show slow queries");
        console.log("  clear-history              - Clear query history");
        console.log(
          "  summary                    - Show comprehensive summary"
        );
        break;
    }
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  } finally {
    await app.close();
  }
}

bootstrap();
