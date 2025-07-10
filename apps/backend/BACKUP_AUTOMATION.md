# StreamBuddy Backup Automation

This document describes the backup automation system for StreamBuddy, which provides intelligent, automated database backup management with monitoring, alerting, and recovery capabilities.

## Overview

The backup automation system includes:

- **Intelligent Scheduling**: Automated backups based on configurable schedules
- **Load-Based Backup**: Backup execution based on database load and system conditions
- **Health Checks**: Pre-backup health validation
- **Auto Retry**: Automatic retry on failure with configurable limits
- **Alerting**: Success/failure notifications
- **Monitoring**: Real-time backup status and statistics
- **REST API**: Full API for backup automation management
- **CLI Tools**: Command-line interface for backup operations

## Features

### 1. Intelligent Backup Scheduling

The system supports multiple backup schedules:

- **Daily Backups**: Every day at 2 AM (configurable)
- **Weekly Backups**: Every Sunday at 3 AM (configurable)
- **Monthly Backups**: 1st of each month at 4 AM (configurable)

Each schedule can be:

- Enabled/disabled independently
- Configured with different retention periods
- Set with compression and encryption options

### 2. Load-Based Backup Execution

Backups are executed only when system conditions are optimal:

- **Database Load**: Maximum 80% connection pool utilization
- **Disk Space**: Minimum 10GB available space
- **Concurrent Backups**: Maximum 2 simultaneous backups
- **Backup Window**: Configurable time window (default: 1 AM - 6 AM)

### 3. Health Checks

Pre-backup health validation includes:

- Connection pool utilization
- Query performance metrics
- Cache hit ratio
- Overall database health

### 4. Auto Retry Mechanism

Failed backups are automatically retried:

- Configurable retry count (default: 3)
- Configurable retry delay (default: 30 minutes)
- Exponential backoff for repeated failures

### 5. Alerting System

Notifications for backup events:

- **Success Alerts**: Optional notifications for successful backups
- **Failure Alerts**: Automatic notifications for failed backups
- **Health Alerts**: System health status notifications

## Configuration

### Environment Variables

```bash
# Backup Automation Settings
DB_BACKUP_AUTOMATION_ENABLED=true
DB_BACKUP_INTELLIGENT_SCHEDULING=true
DB_BACKUP_LOAD_BASED=true
DB_BACKUP_HEALTH_CHECK=true
DB_BACKUP_AUTO_RETRY=true
DB_BACKUP_MAX_RETRIES=3
DB_BACKUP_RETRY_DELAY=30
DB_BACKUP_ALERT_ON_FAILURE=true
DB_BACKUP_ALERT_ON_SUCCESS=false
DB_BACKUP_WINDOW_START=01:00
DB_BACKUP_WINDOW_END=06:00
DB_BACKUP_MAX_LOAD=80
DB_BACKUP_MIN_DISK_SPACE=10
DB_BACKUP_MAX_CONCURRENT=2
```

### Configuration Structure

```typescript
interface BackupAutomationConfig {
  enabled: boolean;
  intelligentScheduling: boolean;
  loadBasedBackup: boolean;
  healthCheckBeforeBackup: boolean;
  autoRetry: boolean;
  maxRetries: number;
  retryDelay: number; // minutes
  alertOnFailure: boolean;
  alertOnSuccess: boolean;
  backupWindow: {
    start: string; // HH:mm
    end: string; // HH:mm
  };
  conditions: {
    maxDatabaseLoad: number; // percentage
    minDiskSpace: number; // GB
    maxConcurrentBackups: number;
  };
}
```

## API Endpoints

### Configuration Management

```http
GET /api/backup-automation/config
PUT /api/backup-automation/config
```

### Backup Execution

```http
POST /api/backup-automation/execute
```

### Event Management

```http
GET /api/backup-automation/events
GET /api/backup-automation/events/:eventId
DELETE /api/backup-automation/events
```

### Monitoring

```http
GET /api/backup-automation/active
GET /api/backup-automation/statistics
GET /api/backup-automation/health
```

### Testing

```http
POST /api/backup-automation/test
```

## CLI Commands

### Configuration

```bash
# Show current configuration
npm run backup:automation:config

# Update configuration
npm run backup:automation:config update enabled true
npm run backup:automation:config update maxRetries 5
```

### Execution

```bash
# Execute backup
npm run backup:automation:execute

# Execute specific schedule
npm run backup:automation:execute daily-backup
```

### Monitoring

```bash
# Show events
npm run backup:automation:events

# Show statistics
npm run backup:automation:statistics

# Show health status
npm run backup:automation:health
```

### Testing

```bash
# Test backup automation
npm run backup:automation:test
```

## Event Tracking

Each backup operation generates an event with:

```typescript
interface BackupAutomationEvent {
  id: string;
  type: "scheduled" | "manual" | "retry" | "emergency";
  scheduleId?: string;
  trigger: string;
  timestamp: Date;
  status: "pending" | "running" | "completed" | "failed" | "cancelled";
  result?: {
    success: boolean;
    backupId?: string;
    error?: string;
    duration: number;
    size: number;
  };
  metadata: {
    databaseLoad: number;
    diskSpace: number;
    concurrentBackups: number;
  };
}
```

## Statistics

The system tracks comprehensive statistics:

- Total events
- Successful events
- Failed events
- Success rate
- Average duration
- Active backups count

## Health Monitoring

Health checks include:

- **Status**: healthy, warning, critical
- **Issues**: List of detected problems
- **Configuration**: Current automation settings
- **Active Backups**: Number of running backups

## Integration

### With Database Monitoring

The backup automation integrates with the database monitoring system to:

- Check database load before backup
- Monitor performance during backup
- Validate backup integrity
- Track backup impact on system performance

### With Alerting System

Integration points for alerting:

- Slack webhooks
- Email notifications
- Webhook endpoints
- Custom alerting systems

## Best Practices

### 1. Schedule Configuration

- Set backup windows during low-traffic periods
- Use different retention periods for different schedules
- Enable compression for large databases
- Use encryption for sensitive data

### 2. Monitoring

- Monitor backup success rates
- Track backup duration trends
- Set up alerts for failures
- Review backup logs regularly

### 3. Testing

- Test backup automation regularly
- Validate backup restoration procedures
- Monitor system impact during backups
- Test alerting mechanisms

### 4. Maintenance

- Clean up old backup files
- Monitor disk space usage
- Update backup schedules as needed
- Review and update automation rules

## Troubleshooting

### Common Issues

1. **Backup Cancelled**: Check system conditions (load, disk space, concurrent backups)
2. **Health Check Failed**: Review database performance metrics
3. **Retry Exhausted**: Check underlying backup service issues
4. **Outside Backup Window**: Verify backup window configuration

### Debugging

```bash
# Check automation health
npm run backup:automation:health

# View recent events
npm run backup:automation:events

# Test backup execution
npm run backup:automation:test
```

### Logs

Monitor application logs for:

- Backup execution events
- Health check results
- Retry attempts
- Alert notifications

## Security Considerations

- Backup files are encrypted when configured
- Access to backup automation API is restricted
- Backup credentials are securely managed
- Audit logs track all backup operations

## Performance Impact

- Backups run during configured windows
- Load-based execution prevents system overload
- Concurrent backup limits prevent resource exhaustion
- Health checks ensure system stability

## Future Enhancements

- Cloud backup integration (AWS S3, Google Cloud Storage)
- Incremental backup support
- Cross-region backup replication
- Advanced scheduling (calendar-based, event-driven)
- Machine learning for optimal backup timing
- Integration with monitoring platforms (Prometheus, Grafana)
