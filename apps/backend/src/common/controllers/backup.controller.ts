import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  HttpStatus,
  HttpException,
  Logger,
} from "@nestjs/common";
import {
  DatabaseBackupService,
  BackupInfo,
  RestoreInfo,
} from "../services/database-backup.service";
import {
  BackupSchedulerService,
  BackupSchedule,
} from "../services/backup-scheduler.service";

export interface CreateBackupDto {
  description?: string;
}

export interface RestoreBackupDto {
  backupId: string;
  confirmRestore: boolean;
}

export interface CreateScheduleDto {
  name: string;
  cronExpression: string;
  retentionDays: number;
  compression?: boolean;
  encryption?: boolean;
}

export interface UpdateScheduleDto {
  name?: string;
  cronExpression?: string;
  enabled?: boolean;
  retentionDays?: number;
  compression?: boolean;
  encryption?: boolean;
}

@Controller("api/backup")
export class BackupController {
  private readonly logger = new Logger(BackupController.name);

  constructor(
    private readonly backupService: DatabaseBackupService,
    private readonly schedulerService: BackupSchedulerService
  ) {}

  @Post()
  async createBackup(
    @Body() createBackupDto: CreateBackupDto
  ): Promise<BackupInfo> {
    try {
      this.logger.log("Manual backup requested");
      return await this.backupService.createBackup();
    } catch (error) {
      this.logger.error("Failed to create backup", error);
      throw new HttpException(
        `Failed to create backup: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get()
  async listBackups(): Promise<BackupInfo[]> {
    try {
      return await this.backupService.listBackups();
    } catch (error) {
      this.logger.error("Failed to list backups", error);
      throw new HttpException(
        `Failed to list backups: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get(":backupId")
  async getBackup(@Param("backupId") backupId: string): Promise<BackupInfo> {
    try {
      const backup = await this.backupService.getBackupStatus(backupId);
      if (!backup) {
        throw new HttpException("Backup not found", HttpStatus.NOT_FOUND);
      }
      return backup;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`Failed to get backup ${backupId}`, error);
      throw new HttpException(
        `Failed to get backup: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete(":backupId")
  async deleteBackup(
    @Param("backupId") backupId: string
  ): Promise<{ message: string }> {
    try {
      await this.backupService.deleteBackup(backupId);
      return { message: "Backup deleted successfully" };
    } catch (error) {
      this.logger.error(`Failed to delete backup ${backupId}`, error);
      throw new HttpException(
        `Failed to delete backup: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post(":backupId/restore")
  async restoreBackup(
    @Param("backupId") backupId: string,
    @Body() restoreBackupDto: RestoreBackupDto
  ): Promise<RestoreInfo> {
    if (!restoreBackupDto.confirmRestore) {
      throw new HttpException(
        "Restore confirmation required. Set confirmRestore to true.",
        HttpStatus.BAD_REQUEST
      );
    }

    try {
      this.logger.log(`Restore requested for backup: ${backupId}`);
      return await this.backupService.restoreBackup(backupId);
    } catch (error) {
      this.logger.error(`Failed to restore backup ${backupId}`, error);
      throw new HttpException(
        `Failed to restore backup: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get("restore/:restoreId")
  async getRestoreStatus(
    @Param("restoreId") restoreId: string
  ): Promise<RestoreInfo> {
    try {
      const restore = await this.backupService.getRestoreStatus(restoreId);
      if (!restore) {
        throw new HttpException("Restore not found", HttpStatus.NOT_FOUND);
      }
      return restore;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`Failed to get restore status ${restoreId}`, error);
      throw new HttpException(
        `Failed to get restore status: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post("test")
  async testBackup(): Promise<{ success: boolean; message: string }> {
    try {
      const success = await this.backupService.testBackup();
      return {
        success,
        message: success
          ? "Backup test completed successfully"
          : "Backup test failed",
      };
    } catch (error) {
      this.logger.error("Backup test failed", error);
      throw new HttpException(
        `Backup test failed: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  // Schedule management endpoints
  @Get("schedules")
  async getSchedules(): Promise<BackupSchedule[]> {
    try {
      return this.schedulerService.getSchedules();
    } catch (error) {
      this.logger.error("Failed to get schedules", error);
      throw new HttpException(
        `Failed to get schedules: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get("schedules/:scheduleId")
  async getSchedule(
    @Param("scheduleId") scheduleId: string
  ): Promise<BackupSchedule> {
    try {
      const schedule = this.schedulerService.getSchedule(scheduleId);
      if (!schedule) {
        throw new HttpException("Schedule not found", HttpStatus.NOT_FOUND);
      }
      return schedule;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`Failed to get schedule ${scheduleId}`, error);
      throw new HttpException(
        `Failed to get schedule: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post("schedules")
  async createSchedule(
    @Body() createScheduleDto: CreateScheduleDto
  ): Promise<BackupSchedule> {
    try {
      const schedule: BackupSchedule = {
        id: `schedule-${Date.now()}`,
        name: createScheduleDto.name,
        cronExpression: createScheduleDto.cronExpression,
        enabled: true,
        retentionDays: createScheduleDto.retentionDays,
        compression: createScheduleDto.compression ?? true,
        encryption: createScheduleDto.encryption ?? false,
        totalRuns: 0,
        successfulRuns: 0,
        failedRuns: 0,
      };

      this.schedulerService.addSchedule(schedule);
      return schedule;
    } catch (error) {
      this.logger.error("Failed to create schedule", error);
      throw new HttpException(
        `Failed to create schedule: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post("schedules/:scheduleId")
  async updateSchedule(
    @Param("scheduleId") scheduleId: string,
    @Body() updateScheduleDto: UpdateScheduleDto
  ): Promise<BackupSchedule> {
    try {
      this.schedulerService.updateSchedule(scheduleId, updateScheduleDto);
      const schedule = this.schedulerService.getSchedule(scheduleId);
      if (!schedule) {
        throw new HttpException("Schedule not found", HttpStatus.NOT_FOUND);
      }
      return schedule;
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      this.logger.error(`Failed to update schedule ${scheduleId}`, error);
      throw new HttpException(
        `Failed to update schedule: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete("schedules/:scheduleId")
  async deleteSchedule(
    @Param("scheduleId") scheduleId: string
  ): Promise<{ message: string }> {
    try {
      this.schedulerService.removeSchedule(scheduleId);
      return { message: "Schedule deleted successfully" };
    } catch (error) {
      this.logger.error(`Failed to delete schedule ${scheduleId}`, error);
      throw new HttpException(
        `Failed to delete schedule: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post("schedules/:scheduleId/enable")
  async enableSchedule(
    @Param("scheduleId") scheduleId: string
  ): Promise<{ message: string }> {
    try {
      this.schedulerService.enableSchedule(scheduleId);
      return { message: "Schedule enabled successfully" };
    } catch (error) {
      this.logger.error(`Failed to enable schedule ${scheduleId}`, error);
      throw new HttpException(
        `Failed to enable schedule: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post("schedules/:scheduleId/disable")
  async disableSchedule(
    @Param("scheduleId") scheduleId: string
  ): Promise<{ message: string }> {
    try {
      this.schedulerService.disableSchedule(scheduleId);
      return { message: "Schedule disabled successfully" };
    } catch (error) {
      this.logger.error(`Failed to disable schedule ${scheduleId}`, error);
      throw new HttpException(
        `Failed to disable schedule: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post("schedules/:scheduleId/run")
  async runScheduleNow(
    @Param("scheduleId") scheduleId: string
  ): Promise<{ message: string }> {
    try {
      await this.schedulerService.runBackupNow(scheduleId);
      return { message: "Schedule executed successfully" };
    } catch (error) {
      this.logger.error(`Failed to run schedule ${scheduleId}`, error);
      throw new HttpException(
        `Failed to run schedule: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get("schedules/next")
  async getNextScheduledBackups(): Promise<
    Array<{ schedule: BackupSchedule; nextRun: Date }>
  > {
    try {
      return this.schedulerService.getNextScheduledBackups();
    } catch (error) {
      this.logger.error("Failed to get next scheduled backups", error);
      throw new HttpException(
        `Failed to get next scheduled backups: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get("schedules/statistics")
  async getBackupStatistics(): Promise<{
    totalSchedules: number;
    enabledSchedules: number;
    totalRuns: number;
    successfulRuns: number;
    failedRuns: number;
    successRate: number;
  }> {
    try {
      return this.schedulerService.getBackupStatistics();
    } catch (error) {
      this.logger.error("Failed to get backup statistics", error);
      throw new HttpException(
        `Failed to get backup statistics: ${error.message}`,
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
}
