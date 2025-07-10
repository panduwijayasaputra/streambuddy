import { ConfigService } from "@nestjs/config";

export interface BackupConfig {
  enabled: boolean;
  path: string;
  retentionDays: number;
  compression: boolean;
  encryption: boolean;
  schedules: {
    daily: {
      enabled: boolean;
      retentionDays: number;
      compression: boolean;
      encryption: boolean;
    };
    weekly: {
      enabled: boolean;
      retentionDays: number;
      compression: boolean;
      encryption: boolean;
    };
    monthly: {
      enabled: boolean;
      retentionDays: number;
      compression: boolean;
      encryption: boolean;
    };
  };
}

export const createBackupConfig = (
  configService: ConfigService
): BackupConfig => ({
  enabled: configService.get<boolean>("DB_BACKUP_ENABLED", true),
  path: configService.get<string>("DB_BACKUP_PATH", "./backups"),
  retentionDays: configService.get<number>("DB_BACKUP_RETENTION_DAYS", 30),
  compression: configService.get<boolean>("DB_BACKUP_COMPRESSION", true),
  encryption: configService.get<boolean>("DB_BACKUP_ENCRYPTION", false),
  schedules: {
    daily: {
      enabled: configService.get<boolean>("DB_BACKUP_DAILY_ENABLED", true),
      retentionDays: configService.get<number>("DB_BACKUP_DAILY_RETENTION", 7),
      compression: configService.get<boolean>(
        "DB_BACKUP_DAILY_COMPRESSION",
        true
      ),
      encryption: configService.get<boolean>(
        "DB_BACKUP_DAILY_ENCRYPTION",
        false
      ),
    },
    weekly: {
      enabled: configService.get<boolean>("DB_BACKUP_WEEKLY_ENABLED", true),
      retentionDays: configService.get<number>(
        "DB_BACKUP_WEEKLY_RETENTION",
        30
      ),
      compression: configService.get<boolean>(
        "DB_BACKUP_WEEKLY_COMPRESSION",
        true
      ),
      encryption: configService.get<boolean>(
        "DB_BACKUP_WEEKLY_ENCRYPTION",
        true
      ),
    },
    monthly: {
      enabled: configService.get<boolean>("DB_BACKUP_MONTHLY_ENABLED", true),
      retentionDays: configService.get<number>(
        "DB_BACKUP_MONTHLY_RETENTION",
        365
      ),
      compression: configService.get<boolean>(
        "DB_BACKUP_MONTHLY_COMPRESSION",
        true
      ),
      encryption: configService.get<boolean>(
        "DB_BACKUP_MONTHLY_ENCRYPTION",
        true
      ),
    },
  },
});
