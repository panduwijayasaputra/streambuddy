# StreamBuddy Database Performance Monitoring

This document describes the database performance monitoring system for StreamBuddy, which provides comprehensive monitoring, alerting, and optimization recommendations for database performance.

## Overview

The database performance monitoring system includes:

- **Real-time Metrics**: Comprehensive database performance metrics
- **Performance Alerts**: Automatic detection and alerting of performance issues
- **Optimization Recommendations**: AI-driven optimization suggestions
- **Trend Analysis**: Historical performance trend tracking
- **Health Monitoring**: Overall database health assessment
- **REST API**: Full API for performance monitoring management
- **CLI Tools**: Command-line interface for performance operations

## Features

### 1. Comprehensive Performance Metrics

The system tracks detailed performance metrics across multiple dimensions:

#### Query Performance

- Total queries executed
- Average execution time
- Slow query count and threshold
- Query type distribution (SELECT, INSERT, UPDATE, DELETE)

#### Connection Management

- Active connections
- Idle connections
- Connection pool utilization
- Connection wait times

#### Cache Performance

- Buffer cache hit ratio
- Shared buffer size
- Effective cache size
- Cache efficiency metrics

#### Lock Management

- Active locks count
- Lock wait times
- Deadlock detection
- Lock utilization percentage

#### Storage Metrics

- Database size
- Table sizes and row counts
- Index usage statistics
- Storage efficiency

#### Performance Indicators

- Transactions per second (TPS)
- Queries per second (QPS)
- System uptime
- Checkpoint and vacuum times

### 2. Intelligent Alerting System

Automatic detection and alerting of performance issues:

#### Alert Categories

- **Query Performance**: Slow queries, high execution times
- **Connection Issues**: High utilization, connection bottlenecks
- **Cache Problems**: Low hit ratios, inefficient caching
- **Lock Contention**: Deadlocks, long wait times
- **Storage Issues**: Space constraints, inefficient storage
- **Performance Degradation**: Overall performance decline

#### Alert Types

- **Warning**: Performance degradation detected
- **Critical**: Severe performance issues requiring immediate attention
- **Info**: Informational alerts and recommendations

### 3. Optimization Recommendations

AI-driven optimization suggestions with:

- **Priority Levels**: Critical, High, Medium, Low
- **Impact Assessment**: Estimated improvement percentages
- **Effort Estimation**: Implementation complexity
- **SQL Suggestions**: Specific SQL for optimizations
- **Category Classification**: Index, Query, Connection, Cache, Maintenance

### 4. Trend Analysis

Historical performance tracking with:

- **Performance Trends**: Increasing, decreasing, or stable
- **Change Tracking**: Quantified performance changes
- **Historical Data**: Up to 1000 data points
- **Trend Visualization**: Performance over time

## Configuration

### Environment Variables

```bash
# Performance Monitoring Settings
DB_SLOW_QUERY_THRESHOLD=1000
DB_PERFORMANCE_MONITORING_ENABLED=true
DB_PERFORMANCE_ALERT_ENABLED=true
DB_PERFORMANCE_HISTORY_SIZE=1000
DB_PERFORMANCE_CHECK_INTERVAL=300
```

### Performance Thresholds

```typescript
interface PerformanceThresholds {
  slowQueryThreshold: number; // milliseconds
  connectionUtilizationWarning: number; // percentage
  connectionUtilizationCritical: number; // percentage
  cacheHitRatioWarning: number; // percentage
  cacheHitRatioCritical: number; // percentage
  lockWaitTimeWarning: number; // milliseconds
  lockWaitTimeCritical: number; // milliseconds
}
```

## API Endpoints

### Metrics Management

```http
GET /api/database/performance/metrics
GET /api/database/performance/summary
POST /api/database/performance/refresh
```

### Alert Management

```http
GET /api/database/performance/alerts
GET /api/database/performance/alerts/:alertId
DELETE /api/database/performance/alerts
```

### Optimization Management

```http
GET /api/database/performance/optimizations
GET /api/database/performance/optimizations/:optimizationId
DELETE /api/database/performance/optimizations
```

### Health and Trends

```http
GET /api/database/performance/health
GET /api/database/performance/trends
GET /api/database/performance/history
```

## CLI Commands

### Metrics

```bash
# Show all performance metrics
npm run db:performance:metrics

# Show specific metrics
npm run db:performance:metrics queries
npm run db:performance:metrics connections
npm run db:performance:metrics cache
npm run db:performance:metrics locks
npm run db:performance:metrics storage
npm run db:performance:metrics performance
```

### Alerts

```bash
# Show all alerts
npm run db:performance:alerts

# Clear all alerts
npm run db:performance:alerts clear

# Show alert details
npm run db:performance:alerts details <alertId>
```

### Optimizations

```bash
# Show all optimizations
npm run db:performance:optimizations

# Clear all optimizations
npm run db:performance:optimizations clear

# Show optimization details
npm run db:performance:optimizations details <optimizationId>
```

### Health and Analysis

```bash
# Show performance health
npm run db:performance:health

# Show performance trends
npm run db:performance:trends

# Show performance summary
npm run db:performance:summary

# Show performance history
npm run db:performance:history [limit]
```

## Data Structures

### Performance Metrics

```typescript
interface PerformanceMetrics {
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
    tps: number;
    qps: number;
    uptime: number;
    checkpointTime: number;
    vacuumTime: number;
  };
}
```

### Performance Alerts

```typescript
interface PerformanceAlert {
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
```

### Performance Optimizations

```typescript
interface PerformanceOptimization {
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
```

## Integration

### With Database Monitoring

The performance monitoring integrates with the general database monitoring system to:

- Share connection pool metrics
- Correlate performance with health status
- Provide comprehensive database insights
- Enable cross-system analysis

### With Backup Automation

Integration with backup automation:

- Performance impact assessment during backups
- Backup scheduling based on performance metrics
- Performance-aware backup execution
- Post-backup performance validation

### With Health Checks

Integration with health check system:

- Performance-based health assessments
- Performance degradation alerts
- Health status correlation
- Performance impact on overall system health

## Best Practices

### 1. Monitoring Setup

- Set appropriate thresholds for your workload
- Monitor key performance indicators regularly
- Set up alerts for critical performance issues
- Review and adjust thresholds based on usage patterns

### 2. Alert Management

- Respond to critical alerts immediately
- Review warning alerts regularly
- Document alert resolution procedures
- Set up escalation procedures for critical issues

### 3. Optimization Implementation

- Prioritize optimizations by impact and effort
- Test optimizations in development first
- Monitor performance after optimization implementation
- Document optimization results and lessons learned

### 4. Performance Analysis

- Review performance trends regularly
- Identify performance patterns and anomalies
- Correlate performance with application changes
- Plan capacity based on performance trends

## Troubleshooting

### Common Issues

1. **High Query Times**: Check for missing indexes, inefficient queries, or resource constraints
2. **Connection Pool Exhaustion**: Increase pool size or optimize connection usage
3. **Low Cache Hit Ratio**: Increase shared buffers or optimize query patterns
4. **Lock Contention**: Review transaction patterns and isolation levels
5. **Storage Issues**: Monitor disk space and optimize table structures

### Debugging

```bash
# Check current performance
npm run db:performance:health

# Review recent alerts
npm run db:performance:alerts

# Analyze performance trends
npm run db:performance:trends

# Get detailed metrics
npm run db:performance:metrics
```

### Performance Tuning

1. **Query Optimization**: Review slow queries and add appropriate indexes
2. **Connection Tuning**: Optimize connection pool settings
3. **Cache Configuration**: Adjust shared buffer and effective cache size
4. **Lock Management**: Review transaction patterns and isolation levels
5. **Storage Optimization**: Regular maintenance and cleanup

## Security Considerations

- Performance data may contain sensitive information
- Access to performance monitoring API should be restricted
- Performance logs should be properly secured
- Audit trails for performance monitoring access

## Performance Impact

- Monitoring overhead is minimal (< 1% CPU)
- Metrics collection is asynchronous
- Historical data is limited to prevent memory issues
- Alerts are generated only when thresholds are exceeded

## Future Enhancements

- Machine learning for predictive performance analysis
- Integration with APM tools (New Relic, DataDog)
- Advanced visualization and dashboards
- Performance benchmarking and comparison tools
- Automated optimization implementation
- Performance SLA monitoring and reporting
