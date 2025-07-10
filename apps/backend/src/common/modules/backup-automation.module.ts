import { Module } from "@nestjs/common";
import { BackupAutomationService } from "../services/backup-automation.service";
import { BackupAutomationController } from "../controllers/backup-automation.controller";
import { BackupModule } from "../services/backup.module";
import { DatabaseMonitoringModule } from "../services/database-monitoring.module";

@Module({
  imports: [BackupModule, DatabaseMonitoringModule],
  providers: [BackupAutomationService],
  controllers: [BackupAutomationController],
  exports: [BackupAutomationService],
})
export class BackupAutomationModule {}
