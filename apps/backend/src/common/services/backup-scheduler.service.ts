import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { DatabaseBackupService } from "./database-backup.service";

export interface BackupSchedule {
  id: string;
  name: string;
  cronExpression: string;
  enabled: boolean;
  retentionDays: number;
  compression: boolean;
  encryption: boolean;
  lastRun?: Date;
  nextRun?: Date;
  totalRuns: number;
  successfulRuns: number;
  failedRuns: number;
}

@Injectable()
export class BackupSchedulerService {
  private readonly logger = new Logger(BackupSchedulerService.name);
  private schedules: BackupSchedule[] = [];
  private timers: Map<string, NodeJS.Timeout> = new Map();

  constructor(
    private readonly backupService: DatabaseBackupService,
    private readonly configService: ConfigService
  ) {
    this.initializeDefaultSchedules();
  }

  private initializeDefaultSchedules(): void {
    // Daily backup at 2 AM
    this.addSchedule({
      id: "daily-backup",
      name: "Daily Backup",
      cronExpression: "0 2 * * *", // 2 AM daily
      enabled: this.configService.get<boolean>("DB_BACKUP_DAILY_ENABLED", true),
      retentionDays: this.configService.get<number>(
        "DB_BACKUP_DAILY_RETENTION",
        7
      ),
      compression: true,
      encryption: false,
      totalRuns: 0,
      successfulRuns: 0,
      failedRuns: 0,
    });

    // Weekly backup on Sunday at 3 AM
    this.addSchedule({
      id: "weekly-backup",
      name: "Weekly Backup",
      cronExpression: "0 3 * * 0", // 3 AM on Sundays
      enabled: this.configService.get<boolean>(
        "DB_BACKUP_WEEKLY_ENABLED",
        true
      ),
      retentionDays: this.configService.get<number>(
        "DB_BACKUP_WEEKLY_RETENTION",
        30
      ),
      compression: true,
      encryption: true,
      totalRuns: 0,
      successfulRuns: 0,
      failedRuns: 0,
    });

    // Monthly backup on 1st of month at 4 AM
    this.addSchedule({
      id: "monthly-backup",
      name: "Monthly Backup",
      cronExpression: "0 4 1 * *", // 4 AM on 1st of month
      enabled: this.configService.get<boolean>(
        "DB_BACKUP_MONTHLY_ENABLED",
        true
      ),
      retentionDays: this.configService.get<number>(
        "DB_BACKUP_MONTHLY_RETENTION",
        365
      ),
      compression: true,
      encryption: true,
      totalRuns: 0,
      successfulRuns: 0,
      failedRuns: 0,
    });
  }

  addSchedule(schedule: BackupSchedule): void {
    this.schedules.push(schedule);
    this.scheduleBackup(schedule);
    this.logger.log(`Added backup schedule: ${schedule.name}`);
  }

  removeSchedule(scheduleId: string): void {
    const schedule = this.schedules.find((s) => s.id === scheduleId);
    if (schedule) {
      this.schedules = this.schedules.filter((s) => s.id !== scheduleId);
      this.cancelSchedule(scheduleId);
      this.logger.log(`Removed backup schedule: ${schedule.name}`);
    }
  }

  updateSchedule(scheduleId: string, updates: Partial<BackupSchedule>): void {
    const schedule = this.schedules.find((s) => s.id === scheduleId);
    if (schedule) {
      Object.assign(schedule, updates);
      this.cancelSchedule(scheduleId);
      this.scheduleBackup(schedule);
      this.logger.log(`Updated backup schedule: ${schedule.name}`);
    }
  }

  getSchedules(): BackupSchedule[] {
    return [...this.schedules];
  }

  getSchedule(scheduleId: string): BackupSchedule | null {
    return this.schedules.find((s) => s.id === scheduleId) || null;
  }

  enableSchedule(scheduleId: string): void {
    const schedule = this.schedules.find((s) => s.id === scheduleId);
    if (schedule) {
      schedule.enabled = true;
      this.scheduleBackup(schedule);
      this.logger.log(`Enabled backup schedule: ${schedule.name}`);
    }
  }

  disableSchedule(scheduleId: string): void {
    const schedule = this.schedules.find((s) => s.id === scheduleId);
    if (schedule) {
      schedule.enabled = false;
      this.cancelSchedule(scheduleId);
      this.logger.log(`Disabled backup schedule: ${schedule.name}`);
    }
  }

  async runBackupNow(scheduleId?: string): Promise<void> {
    if (scheduleId) {
      const schedule = this.schedules.find((s) => s.id === scheduleId);
      if (schedule) {
        await this.executeBackup(schedule);
      }
    } else {
      // Run all enabled schedules
      for (const schedule of this.schedules.filter((s) => s.enabled)) {
        await this.executeBackup(schedule);
      }
    }
  }

  private scheduleBackup(schedule: BackupSchedule): void {
    if (!schedule.enabled) {
      return;
    }

    // Cancel existing timer
    this.cancelSchedule(schedule.id);

    // Calculate next run time
    const nextRun = this.calculateNextRun(schedule.cronExpression);
    schedule.nextRun = nextRun;

    // Schedule the backup
    const delay = nextRun.getTime() - Date.now();
    if (delay > 0) {
      const timer = setTimeout(() => {
        this.executeBackup(schedule);
        this.scheduleBackup(schedule); // Reschedule for next run
      }, delay);

      this.timers.set(schedule.id, timer);
      this.logger.log(
        `Scheduled backup: ${schedule.name} at ${nextRun.toISOString()}`
      );
    }
  }

  private cancelSchedule(scheduleId: string): void {
    const timer = this.timers.get(scheduleId);
    if (timer) {
      clearTimeout(timer);
      this.timers.delete(scheduleId);
    }
  }

  private calculateNextRun(cronExpression: string): Date {
    // Simple cron parser for common patterns
    const parts = cronExpression.split(" ");
    const [minute, hour, day, month, dayOfWeek] = parts;

    const now = new Date();
    const next = new Date(now);

    // Reset to start of minute
    next.setSeconds(0, 0);

    if (minute !== "*") {
      next.setMinutes(parseInt(minute));
    }

    if (hour !== "*") {
      next.setHours(parseInt(hour));
    }

    if (day !== "*") {
      next.setDate(parseInt(day));
    }

    if (month !== "*") {
      next.setMonth(parseInt(month) - 1);
    }

    // If the calculated time is in the past, move to next occurrence
    if (next <= now) {
      if (cronExpression.includes("* * * *")) {
        // Daily schedule
        next.setDate(next.getDate() + 1);
      } else if (cronExpression.includes("* * 0")) {
        // Weekly schedule
        next.setDate(next.getDate() + 7);
      } else if (cronExpression.includes("1 * *")) {
        // Monthly schedule
        next.setMonth(next.getMonth() + 1);
      }
    }

    return next;
  }

  private async executeBackup(schedule: BackupSchedule): Promise<void> {
    schedule.lastRun = new Date();
    schedule.totalRuns++;

    try {
      this.logger.log(`Executing scheduled backup: ${schedule.name}`);

      const backup = await this.backupService.createBackup();

      schedule.successfulRuns++;
      this.logger.log(
        `Scheduled backup completed: ${schedule.name} -> ${backup.filename}`
      );
    } catch (error) {
      schedule.failedRuns++;
      this.logger.error(`Scheduled backup failed: ${schedule.name}`, error);
    }
  }

  getNextScheduledBackups(): Array<{
    schedule: BackupSchedule;
    nextRun: Date;
  }> {
    return this.schedules
      .filter((s) => s.enabled && s.nextRun)
      .map((schedule) => ({
        schedule,
        nextRun: schedule.nextRun!,
      }))
      .sort((a, b) => a.nextRun.getTime() - b.nextRun.getTime());
  }

  getBackupStatistics(): {
    totalSchedules: number;
    enabledSchedules: number;
    totalRuns: number;
    successfulRuns: number;
    failedRuns: number;
    successRate: number;
  } {
    const enabledSchedules = this.schedules.filter((s) => s.enabled);
    const totalRuns = this.schedules.reduce((sum, s) => sum + s.totalRuns, 0);
    const successfulRuns = this.schedules.reduce(
      (sum, s) => sum + s.successfulRuns,
      0
    );
    const failedRuns = this.schedules.reduce((sum, s) => sum + s.failedRuns, 0);
    const successRate = totalRuns > 0 ? (successfulRuns / totalRuns) * 100 : 0;

    return {
      totalSchedules: this.schedules.length,
      enabledSchedules: enabledSchedules.length,
      totalRuns,
      successfulRuns,
      failedRuns,
      successRate,
    };
  }

  onModuleDestroy(): void {
    // Clean up all timers
    for (const [scheduleId, timer] of this.timers) {
      clearTimeout(timer);
    }
    this.timers.clear();
  }
}
