#!/usr/bin/env ts-node

import { NestFactory } from "@nestjs/core";
import { AppModule } from "../app.module";
import { DatabaseBackupService } from "../common/services/database-backup.service";
import { BackupSchedulerService } from "../common/services/backup-scheduler.service";

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const backupService = app.get(DatabaseBackupService);
  const schedulerService = app.get(BackupSchedulerService);

  const command = process.argv[2];
  const args = process.argv.slice(3);

  try {
    switch (command) {
      case "create":
        console.log("Creating backup...");
        const backup = await backupService.createBackup();
        console.log(
          `Backup created: ${backup.filename} (${backup.size} bytes)`
        );
        break;

      case "list":
        console.log("Listing backups...");
        const backups = await backupService.listBackups();
        if (backups.length === 0) {
          console.log("No backups found");
        } else {
          console.log("Available backups:");
          backups.forEach((backup) => {
            console.log(
              `- ${backup.filename} (${backup.size} bytes, ${backup.createdAt})`
            );
          });
        }
        break;

      case "restore":
        if (args.length === 0) {
          console.error("Usage: restore <backup-id>");
          process.exit(1);
        }
        const backupId = args[0];
        console.log(`Restoring backup: ${backupId}`);
        const restore = await backupService.restoreBackup(backupId);
        console.log(`Restore completed: ${restore.id}`);
        break;

      case "test":
        console.log("Testing backup...");
        const success = await backupService.testBackup();
        console.log(success ? "Backup test passed" : "Backup test failed");
        break;

      case "schedules":
        console.log("Backup schedules:");
        const schedules = schedulerService.getSchedules();
        schedules.forEach((schedule) => {
          console.log(
            `- ${schedule.name} (${schedule.enabled ? "enabled" : "disabled"})`
          );
          console.log(`  Cron: ${schedule.cronExpression}`);
          console.log(`  Next run: ${schedule.nextRun}`);
          console.log(
            `  Runs: ${schedule.successfulRuns}/${schedule.totalRuns} successful`
          );
        });
        break;

      case "run-schedule":
        if (args.length === 0) {
          console.error("Usage: run-schedule <schedule-id>");
          process.exit(1);
        }
        const scheduleId = args[0];
        console.log(`Running schedule: ${scheduleId}`);
        await schedulerService.runBackupNow(scheduleId);
        console.log("Schedule executed");
        break;

      case "statistics":
        console.log("Backup statistics:");
        const stats = schedulerService.getBackupStatistics();
        console.log(`Total schedules: ${stats.totalSchedules}`);
        console.log(`Enabled schedules: ${stats.enabledSchedules}`);
        console.log(`Total runs: ${stats.totalRuns}`);
        console.log(`Successful runs: ${stats.successfulRuns}`);
        console.log(`Failed runs: ${stats.failedRuns}`);
        console.log(`Success rate: ${stats.successRate.toFixed(2)}%`);
        break;

      case "next":
        console.log("Next scheduled backups:");
        const nextBackups = schedulerService.getNextScheduledBackups();
        if (nextBackups.length === 0) {
          console.log("No scheduled backups");
        } else {
          nextBackups.forEach(({ schedule, nextRun }) => {
            console.log(`- ${schedule.name}: ${nextRun}`);
          });
        }
        break;

      default:
        console.log("Usage:");
        console.log("  create                    - Create a new backup");
        console.log("  list                      - List all backups");
        console.log("  restore <backup-id>       - Restore a backup");
        console.log("  test                      - Test backup functionality");
        console.log("  schedules                 - List backup schedules");
        console.log("  run-schedule <schedule-id> - Run a schedule now");
        console.log("  statistics                - Show backup statistics");
        console.log(
          "  next                      - Show next scheduled backups"
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
