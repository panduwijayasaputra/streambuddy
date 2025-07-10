# StreamBuddy Database Backup System

## Overview

The StreamBuddy backup system provides automated database backup and recovery capabilities with scheduled backups, compression, encryption, and comprehensive monitoring.

## Features

- **Automated Backups**: Scheduled daily, weekly, and monthly backups
- **Manual Backups**: On-demand backup creation via API or CLI
- **Backup Verification**: Checksum validation and integrity checks
- **Compression**: Optional backup compression to save storage space
- **Encryption**: Optional backup encryption for security
- **Retention Management**: Automatic cleanup of old backups
- **Restore Capabilities**: Full database restore from backups
- **Monitoring**: Comprehensive backup statistics and status tracking
- **CLI Tools**: Command-line interface for backup operations
- **REST API**: Full backup management via HTTP endpoints

## Configuration

### Environment Variables

```bash
# Backup System
DB_BACKUP_ENABLED=true
DB_BACKUP_PATH=./backups
DB_BACKUP_RETENTION_DAYS=30
DB_BACKUP_COMPRESSION=true
DB_BACKUP_ENCRYPTION=false

# Daily Backup Schedule
DB_BACKUP_DAILY_ENABLED=true
DB_BACKUP_DAILY_RETENTION=7
DB_BACKUP_DAILY_COMPRESSION=true
DB_BACKUP_DAILY_ENCRYPTION=false

# Weekly Backup Schedule
DB_BACKUP_WEEKLY_ENABLED=true
DB_BACKUP_WEEKLY_RETENTION=30
DB_BACKUP_WEEKLY_COMPRESSION=true
DB_BACKUP_WEEKLY_ENCRYPTION=true

# Monthly Backup Schedule
DB_BACKUP_MONTHLY_ENABLED=true
DB_BACKUP_MONTHLY_RETENTION=365
DB_BACKUP_MONTHLY_COMPRESSION=true
DB_BACKUP_MONTHLY_ENCRYPTION=true
```

### Default Schedules

1. **Daily Backup**: 2:00 AM every day (retention: 7 days)
2. **Weekly Backup**: 3:00 AM every Sunday (retention: 30 days)
3. **Monthly Backup**: 4:00 AM on the 1st of each month (retention: 365 days)

## API Endpoints

### Backup Management

- `POST /api/backup` - Create a new backup
- `GET /api/backup` - List all backups
- `GET /api/backup/:backupId` - Get backup details
- `DELETE /api/backup/:backupId` - Delete a backup
- `POST /api/backup/:backupId/restore` - Restore from backup
- `GET /api/backup/restore/:restoreId` - Get restore status
- `POST /api/backup/test` - Test backup functionality

### Schedule Management

- `GET /api/backup/schedules` - List all schedules
- `GET /api/backup/schedules/:scheduleId` - Get schedule details
- `POST /api/backup/schedules` - Create a new schedule
- `POST /api/backup/schedules/:scheduleId` - Update a schedule
- `DELETE /api/backup/schedules/:scheduleId` - Delete a schedule
- `POST /api/backup/schedules/:scheduleId/enable` - Enable a schedule
- `POST /api/backup/schedules/:scheduleId/disable` - Disable a schedule
- `POST /api/backup/schedules/:scheduleId/run` - Run a schedule now
- `GET /api/backup/schedules/next` - Get next scheduled backups
- `GET /api/backup/schedules/statistics` - Get backup statistics

## CLI Commands

### Basic Backup Operations

```bash
# Create a new backup
npm run backup:create

# List all backups
npm run backup:list

# Test backup functionality
npm run backup:test

# Restore from backup (replace BACKUP_ID)
npm run backup:restore BACKUP_ID
```

### Schedule Management

```bash
# List all schedules
npm run backup:schedules

# Run a schedule now (replace SCHEDULE_ID)
npm run backup:run-schedule SCHEDULE_ID

# Show backup statistics
npm run backup:statistics

# Show next scheduled backups
npm run backup:next
```

## Backup File Structure

Backups are stored in the configured backup directory with the following naming convention:

```
streambuddy_backup_YYYY-MM-DDTHH-MM-SS-sssZ.sql
```

Example: `streambuddy_backup_2024-01-15T02-00-00-000Z.sql`

## Backup Information

Each backup includes:

- **ID**: Unique backup identifier
- **Filename**: Backup file name
- **Size**: File size in bytes
- **Created At**: Timestamp of backup creation
- **Checksum**: SHA-256 checksum for integrity verification
- **Status**: Current backup status (completed, failed, in_progress)
- **Duration**: Time taken to create the backup
- **Error**: Error message if backup failed

## Restore Process

1. **Verification**: Backup file existence and checksum validation
2. **Preparation**: Database connection verification
3. **Restore**: Execute pg_restore command
4. **Validation**: Verify restore completion
5. **Cleanup**: Remove temporary files

## Security Considerations

- **File Permissions**: Backup files should have restricted permissions
- **Encryption**: Sensitive backups should be encrypted
- **Access Control**: Backup API endpoints should be protected
- **Network Security**: Backup storage should be in secure location
- **Audit Logging**: All backup operations are logged

## Monitoring and Alerts

The backup system provides:

- **Success Rate Tracking**: Monitor backup success rates
- **Schedule Monitoring**: Track scheduled backup execution
- **Error Logging**: Comprehensive error logging
- **Performance Metrics**: Backup duration and size tracking
- **Health Checks**: Integration with health check system

## Troubleshooting

### Common Issues

1. **Permission Denied**: Ensure proper file permissions on backup directory
2. **Database Connection**: Verify database connection settings
3. **Disk Space**: Monitor available disk space for backups
4. **pg_dump Not Found**: Ensure PostgreSQL client tools are installed
5. **Schedule Not Running**: Check if schedules are enabled and properly configured

### Debug Commands

```bash
# Test backup functionality
npm run backup:test

# Check backup schedules
npm run backup:schedules

# View backup statistics
npm run backup:statistics
```

## Best Practices

1. **Regular Testing**: Test backup and restore procedures regularly
2. **Monitoring**: Monitor backup success rates and disk usage
3. **Documentation**: Document backup procedures and recovery steps
4. **Security**: Implement proper access controls and encryption
5. **Retention**: Configure appropriate retention policies
6. **Verification**: Regularly verify backup integrity
7. **Disaster Recovery**: Test full system recovery procedures

## Integration

The backup system integrates with:

- **Health Checks**: Backup status included in health checks
- **Logging**: Comprehensive logging integration
- **Configuration**: Environment-based configuration
- **Error Handling**: Global error handling integration
- **Security**: Middleware security integration
