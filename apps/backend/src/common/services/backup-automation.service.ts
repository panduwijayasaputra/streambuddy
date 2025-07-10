import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DatabaseBackupService } from "./database-backup.service";
import { BackupSchedulerService } from "./backup-scheduler.service";
import { DatabaseMonitoringService } from "./database-monitoring.service";

export interface BackupAutomationConfig {
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

export interface BackupAutomationEvent {
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

@Injectable()
export class BackupAutomationService {
  private readonly logger = new Logger(BackupAutomationService.name);
  private automationEvents: BackupAutomationEvent[] = [];
  private activeBackups: Set<string> = new Set();
  private config: BackupAutomationConfig;

  constructor(
    private readonly backupService: DatabaseBackupService,
    private readonly schedulerService: BackupSchedulerService,
    private readonly monitoringService: DatabaseMonitoringService,
    private readonly configService: ConfigService
  ) {
    this.initializeConfig();
  }

  private initializeConfig(): void {
    this.config = {
      enabled: this.configService.get<boolean>(
        "DB_BACKUP_AUTOMATION_ENABLED",
        true
      ),
      intelligentScheduling: this.configService.get<boolean>(
        "DB_BACKUP_INTELLIGENT_SCHEDULING",
        true
      ),
      loadBasedBackup: this.configService.get<boolean>(
        "DB_BACKUP_LOAD_BASED",
        true
      ),
      healthCheckBeforeBackup: this.configService.get<boolean>(
        "DB_BACKUP_HEALTH_CHECK",
        true
      ),
      autoRetry: this.configService.get<boolean>("DB_BACKUP_AUTO_RETRY", true),
      maxRetries: this.configService.get<number>("DB_BACKUP_MAX_RETRIES", 3),
      retryDelay: this.configService.get<number>("DB_BACKUP_RETRY_DELAY", 30),
      alertOnFailure: this.configService.get<boolean>(
        "DB_BACKUP_ALERT_ON_FAILURE",
        true
      ),
      alertOnSuccess: this.configService.get<boolean>(
        "DB_BACKUP_ALERT_ON_SUCCESS",
        false
      ),
      backupWindow: {
        start: this.configService.get<string>(
          "DB_BACKUP_WINDOW_START",
          "01:00"
        ),
        end: this.configService.get<string>("DB_BACKUP_WINDOW_END", "06:00"),
      },
      conditions: {
        maxDatabaseLoad: this.configService.get<number>(
          "DB_BACKUP_MAX_LOAD",
          80
        ),
        minDiskSpace: this.configService.get<number>(
          "DB_BACKUP_MIN_DISK_SPACE",
          10
        ),
        maxConcurrentBackups: this.configService.get<number>(
          "DB_BACKUP_MAX_CONCURRENT",
          2
        ),
      },
    };
  }

  async executeAutomatedBackup(
    scheduleId?: string
  ): Promise<BackupAutomationEvent> {
    const eventId = this.generateEventId();
    const event: BackupAutomationEvent = {
      id: eventId,
      type: scheduleId ? "scheduled" : "manual",
      scheduleId,
      trigger: scheduleId ? "schedule" : "manual",
      timestamp: new Date(),
      status: "pending",
      metadata: {
        databaseLoad: 0,
        diskSpace: 0,
        concurrentBackups: this.activeBackups.size,
      },
    };

    this.automationEvents.push(event);
    this.logger.log(`Starting automated backup: ${eventId}`);

    try {
      // Check conditions before backup
      const conditions = await this.checkBackupConditions();
      if (!conditions.canProceed) {
        event.status = "cancelled";
        event.result = {
          success: false,
          error: conditions.reason,
          duration: 0,
          size: 0,
        };
        this.logger.warn(`Backup cancelled: ${conditions.reason}`);
        return event;
      }

      // Update metadata
      event.metadata = conditions.metadata;
      event.status = "running";

      // Perform health check if enabled
      if (this.config.healthCheckBeforeBackup) {
        const healthCheck = await this.performHealthCheck();
        if (!healthCheck.healthy) {
          event.status = "failed";
          event.result = {
            success: false,
            error: `Health check failed: ${healthCheck.issues.join(", ")}`,
            duration: 0,
            size: 0,
          };
          this.logger.error(
            `Backup failed due to health check: ${healthCheck.issues.join(", ")}`
          );
          return event;
        }
      }

      // Execute backup
      const startTime = Date.now();
      this.activeBackups.add(eventId);

      const backup = await this.backupService.createBackup();

      const duration = Date.now() - startTime;
      this.activeBackups.delete(eventId);

      event.status = "completed";
      event.result = {
        success: true,
        backupId: backup.id,
        duration,
        size: backup.size,
      };

      this.logger.log(
        `Automated backup completed: ${eventId} -> ${backup.filename}`
      );

      // Send success alert if enabled
      if (this.config.alertOnSuccess) {
        await this.sendBackupAlert(event, "success");
      }

      return event;
    } catch (error) {
      this.activeBackups.delete(eventId);
      event.status = "failed";
      event.result = {
        success: false,
        error: error.message,
        duration: Date.now() - event.timestamp.getTime(),
        size: 0,
      };

      this.logger.error(`Automated backup failed: ${eventId}`, error);

      // Send failure alert if enabled
      if (this.config.alertOnFailure) {
        await this.sendBackupAlert(event, "failure");
      }

      // Auto retry if enabled
      if (this.config.autoRetry && event.type !== "retry") {
        await this.scheduleRetry(event);
      }

      return event;
    }
  }

  private async checkBackupConditions(): Promise<{
    canProceed: boolean;
    reason?: string;
    metadata: {
      databaseLoad: number;
      diskSpace: number;
      concurrentBackups: number;
    };
  }> {
    try {
      // Check database load
      const metrics = await this.monitoringService.getDatabaseMetrics();
      const databaseLoad =
        metrics.connectionPool.total > 0
          ? (metrics.connectionPool.active / metrics.connectionPool.total) * 100
          : 0;

      // Check disk space (simplified)
      const diskSpace = 50; // Would need actual disk space check

      // Check concurrent backups
      const concurrentBackups = this.activeBackups.size;

      const metadata = {
        databaseLoad,
        diskSpace,
        concurrentBackups,
      };

      // Check conditions
      if (databaseLoad > this.config.conditions.maxDatabaseLoad) {
        return {
          canProceed: false,
          reason: `Database load too high: ${databaseLoad.toFixed(2)}%`,
          metadata,
        };
      }

      if (diskSpace < this.config.conditions.minDiskSpace) {
        return {
          canProceed: false,
          reason: `Insufficient disk space: ${diskSpace}GB available`,
          metadata,
        };
      }

      if (concurrentBackups >= this.config.conditions.maxConcurrentBackups) {
        return {
          canProceed: false,
          reason: `Too many concurrent backups: ${concurrentBackups}`,
          metadata,
        };
      }

      // Check backup window
      if (this.config.backupWindow) {
        const now = new Date();
        const currentTime = now.getHours() * 60 + now.getMinutes();
        const [startHour, startMinute] = this.config.backupWindow.start
          .split(":")
          .map(Number);
        const [endHour, endMinute] = this.config.backupWindow.end
          .split(":")
          .map(Number);
        const startTime = startHour * 60 + startMinute;
        const endTime = endHour * 60 + endMinute;

        if (currentTime < startTime || currentTime > endTime) {
          return {
            canProceed: false,
            reason: `Outside backup window: ${this.config.backupWindow.start} - ${this.config.backupWindow.end}`,
            metadata,
          };
        }
      }

      return {
        canProceed: true,
        metadata,
      };
    } catch (error) {
      this.logger.error("Failed to check backup conditions", error);
      return {
        canProceed: false,
        reason: `Failed to check conditions: ${error.message}`,
        metadata: {
          databaseLoad: 0,
          diskSpace: 0,
          concurrentBackups: this.activeBackups.size,
        },
      };
    }
  }

  private async performHealthCheck(): Promise<{
    healthy: boolean;
    issues: string[];
  }> {
    try {
      const metrics = await this.monitoringService.getDatabaseMetrics();
      const issues: string[] = [];

      // Check connection pool health
      if (metrics.connectionPool.active / metrics.connectionPool.total > 0.9) {
        issues.push("High connection pool utilization");
      }

      // Check performance
      if (metrics.performance.avgQueryTime > 2000) {
        issues.push("High average query time");
      }

      // Check cache hit ratio
      if (metrics.performance.cacheHitRatio < 70) {
        issues.push("Low cache hit ratio");
      }

      return {
        healthy: issues.length === 0,
        issues,
      };
    } catch (error) {
      this.logger.error("Failed to perform health check", error);
      return {
        healthy: false,
        issues: ["Health check failed"],
      };
    }
  }

  private async scheduleRetry(
    failedEvent: BackupAutomationEvent
  ): Promise<void> {
    const retryCount = this.automationEvents.filter(
      (e) => e.scheduleId === failedEvent.scheduleId && e.type === "retry"
    ).length;

    if (retryCount >= this.config.maxRetries) {
      this.logger.error(`Max retries reached for backup: ${failedEvent.id}`);
      return;
    }

    const retryDelay = this.config.retryDelay * 60 * 1000; // Convert to milliseconds
    setTimeout(async () => {
      const retryEvent: BackupAutomationEvent = {
        id: this.generateEventId(),
        type: "retry",
        scheduleId: failedEvent.scheduleId,
        trigger: `retry-${retryCount + 1}`,
        timestamp: new Date(),
        status: "pending",
        metadata: {
          databaseLoad: 0,
          diskSpace: 0,
          concurrentBackups: this.activeBackups.size,
        },
      };

      this.logger.log(`Scheduling retry backup: ${retryEvent.id}`);
      await this.executeAutomatedBackup(failedEvent.scheduleId);
    }, retryDelay);
  }

  private async sendBackupAlert(
    event: BackupAutomationEvent,
    type: "success" | "failure"
  ): Promise<void> {
    try {
      const message =
        type === "success"
          ? `✅ Backup completed successfully: ${event.result?.backupId} (${event.result?.size} bytes, ${event.result?.duration}ms)`
          : `❌ Backup failed: ${event.result?.error}`;

      this.logger.log(`Backup alert: ${message}`);

      // Here you would integrate with your alerting system
      // For example: Slack, email, webhook, etc.
    } catch (error) {
      this.logger.error("Failed to send backup alert", error);
    }
  }

  private generateEventId(): string {
    return `backup-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  getAutomationConfig(): BackupAutomationConfig {
    return { ...this.config };
  }

  updateAutomationConfig(updates: Partial<BackupAutomationConfig>): void {
    Object.assign(this.config, updates);
    this.logger.log("Backup automation configuration updated");
  }

  getAutomationEvents(): BackupAutomationEvent[] {
    return [...this.automationEvents];
  }

  getActiveBackups(): string[] {
    return Array.from(this.activeBackups);
  }

  async getAutomationStatistics(): Promise<{
    totalEvents: number;
    successfulEvents: number;
    failedEvents: number;
    successRate: number;
    averageDuration: number;
    activeBackups: number;
  }> {
    const totalEvents = this.automationEvents.length;
    const successfulEvents = this.automationEvents.filter(
      (e) => e.status === "completed"
    ).length;
    const failedEvents = this.automationEvents.filter(
      (e) => e.status === "failed"
    ).length;
    const successRate =
      totalEvents > 0 ? (successfulEvents / totalEvents) * 100 : 0;

    const completedEvents = this.automationEvents.filter(
      (e) => e.result?.duration
    );
    const averageDuration =
      completedEvents.length > 0
        ? completedEvents.reduce(
            (sum, e) => sum + (e.result?.duration || 0),
            0
          ) / completedEvents.length
        : 0;

    return {
      totalEvents,
      successfulEvents,
      failedEvents,
      successRate,
      averageDuration,
      activeBackups: this.activeBackups.size,
    };
  }

  clearEventHistory(): void {
    this.automationEvents = [];
    this.logger.log("Backup automation event history cleared");
  }
}
