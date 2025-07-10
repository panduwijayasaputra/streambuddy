import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { DatabaseBackupService } from "./database-backup.service";
import { BackupSchedulerService } from "./backup-scheduler.service";
import { BackupController } from "../controllers/backup.controller";

@Module({
  imports: [ConfigModule],
  controllers: [BackupController],
  providers: [DatabaseBackupService, BackupSchedulerService],
  exports: [DatabaseBackupService, BackupSchedulerService],
})
export class BackupModule {}
