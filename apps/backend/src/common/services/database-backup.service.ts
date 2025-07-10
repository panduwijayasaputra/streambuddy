import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { exec } from "child_process";
import { promisify } from "util";
import * as fs from "fs";
import * as path from "path";
import * as crypto from "crypto";

const execAsync = promisify(exec);

export interface BackupConfig {
  enabled: boolean;
  schedule: string; // cron expression
  retention: number; // days
  compression: boolean;
  encryption: boolean;
  backupPath: string;
  pgDumpPath: string;
  pgRestorePath: string;
}

export interface BackupInfo {
  id: string;
  filename: string;
  size: number;
  createdAt: Date;
  checksum: string;
  status: "completed" | "failed" | "in_progress";
  duration: number;
  error?: string;
}

export interface RestoreInfo {
  id: string;
  backupId: string;
  startedAt: Date;
  completedAt?: Date;
  status: "in_progress" | "completed" | "failed";
  error?: string;
}

@Injectable()
export class DatabaseBackupService {
  private readonly logger = new Logger(DatabaseBackupService.name);
  private backups: BackupInfo[] = [];
  private restores: RestoreInfo[] = [];

  constructor(private readonly configService: ConfigService) {}

  async createBackup(): Promise<BackupInfo> {
    const backupId = this.generateBackupId();
    const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
    const filename = `streambuddy_backup_${timestamp}.sql`;
    const backupPath = this.getBackupPath();
    const fullPath = path.join(backupPath, filename);

    const backupInfo: BackupInfo = {
      id: backupId,
      filename,
      size: 0,
      createdAt: new Date(),
      checksum: "",
      status: "in_progress",
      duration: 0,
    };

    this.backups.push(backupInfo);
    const startTime = Date.now();

    try {
      // Ensure backup directory exists
      await this.ensureBackupDirectory(backupPath);

      // Get database connection details
      const dbConfig = this.getDatabaseConfig();

      // Create pg_dump command
      const pgDumpCmd = this.buildPgDumpCommand(dbConfig, fullPath);

      this.logger.log(`Starting backup: ${filename}`);

      // Execute backup
      const { stdout, stderr } = await execAsync(pgDumpCmd);

      // pg_dump writes verbose output to stderr, which is normal
      // Only treat as error if it contains actual error messages
      if (
        stderr &&
        !stderr.includes("WARNING") &&
        !stderr.includes("pg_dump:")
      ) {
        throw new Error(`pg_dump error: ${stderr}`);
      }

      // Get file stats
      const stats = await fs.promises.stat(fullPath);
      const checksum = await this.calculateChecksum(fullPath);

      // Update backup info
      backupInfo.size = stats.size;
      backupInfo.checksum = checksum;
      backupInfo.status = "completed";
      backupInfo.duration = Date.now() - startTime;

      this.logger.log(
        `Backup completed: ${filename} (${this.formatBytes(stats.size)})`
      );

      // Clean up old backups
      await this.cleanupOldBackups();

      return backupInfo;
    } catch (error) {
      backupInfo.status = "failed";
      backupInfo.error = error.message;
      backupInfo.duration = Date.now() - startTime;

      this.logger.error(`Backup failed: ${filename}`, error);
      throw error;
    }
  }

  async restoreBackup(backupId: string): Promise<RestoreInfo> {
    const backup = this.backups.find((b) => b.id === backupId);
    if (!backup) {
      throw new Error(`Backup not found: ${backupId}`);
    }

    const restoreId = this.generateRestoreId();
    const backupPath = this.getBackupPath();
    const fullPath = path.join(backupPath, backup.filename);

    const restoreInfo: RestoreInfo = {
      id: restoreId,
      backupId,
      startedAt: new Date(),
      status: "in_progress",
    };

    this.restores.push(restoreInfo);

    try {
      // Verify backup file exists
      if (!fs.existsSync(fullPath)) {
        throw new Error(`Backup file not found: ${fullPath}`);
      }

      // Verify checksum
      const currentChecksum = await this.calculateChecksum(fullPath);
      if (currentChecksum !== backup.checksum) {
        throw new Error("Backup file checksum mismatch");
      }

      // Get database connection details
      const dbConfig = this.getDatabaseConfig();

      // Create pg_restore command
      const pgRestoreCmd = this.buildPgRestoreCommand(dbConfig, fullPath);

      this.logger.log(`Starting restore from: ${backup.filename}`);

      // Execute restore
      const { stdout, stderr } = await execAsync(pgRestoreCmd);

      if (stderr && !stderr.includes("WARNING")) {
        throw new Error(`pg_restore error: ${stderr}`);
      }

      restoreInfo.status = "completed";
      restoreInfo.completedAt = new Date();

      this.logger.log(`Restore completed: ${backup.filename}`);

      return restoreInfo;
    } catch (error) {
      restoreInfo.status = "failed";
      restoreInfo.error = error.message;

      this.logger.error(`Restore failed: ${backup.filename}`, error);
      throw error;
    }
  }

  async listBackups(): Promise<BackupInfo[]> {
    const backupPath = this.getBackupPath();

    try {
      const files = await fs.promises.readdir(backupPath);
      const backupFiles = files.filter((file) => file.endsWith(".sql"));

      const backups: BackupInfo[] = [];

      for (const file of backupFiles) {
        const fullPath = path.join(backupPath, file);
        const stats = await fs.promises.stat(fullPath);
        const checksum = await this.calculateChecksum(fullPath);

        backups.push({
          id: this.generateBackupId(),
          filename: file,
          size: stats.size,
          createdAt: stats.birthtime,
          checksum,
          status: "completed",
          duration: 0,
        });
      }

      return backups.sort(
        (a, b) => b.createdAt.getTime() - a.createdAt.getTime()
      );
    } catch (error) {
      this.logger.error("Failed to list backups", error);
      return [];
    }
  }

  async getBackupStatus(backupId: string): Promise<BackupInfo | null> {
    return this.backups.find((b) => b.id === backupId) || null;
  }

  async getRestoreStatus(restoreId: string): Promise<RestoreInfo | null> {
    return this.restores.find((r) => r.id === restoreId) || null;
  }

  async deleteBackup(backupId: string): Promise<void> {
    const backup = this.backups.find((b) => b.id === backupId);
    if (!backup) {
      throw new Error(`Backup not found: ${backupId}`);
    }

    const backupPath = this.getBackupPath();
    const fullPath = path.join(backupPath, backup.filename);

    try {
      await fs.promises.unlink(fullPath);
      this.backups = this.backups.filter((b) => b.id !== backupId);
      this.logger.log(`Deleted backup: ${backup.filename}`);
    } catch (error) {
      this.logger.error(`Failed to delete backup: ${backup.filename}`, error);
      throw error;
    }
  }

  async testBackup(): Promise<boolean> {
    try {
      const backup = await this.createBackup();
      await this.deleteBackup(backup.id);
      return true;
    } catch (error) {
      this.logger.error("Backup test failed", error);
      return false;
    }
  }

  private generateBackupId(): string {
    return crypto.randomBytes(8).toString("hex");
  }

  private generateRestoreId(): string {
    return crypto.randomBytes(8).toString("hex");
  }

  private getBackupPath(): string {
    return this.configService.get<string>("DB_BACKUP_PATH", "./backups");
  }

  private async ensureBackupDirectory(path: string): Promise<void> {
    try {
      await fs.promises.mkdir(path, { recursive: true });
    } catch (error) {
      if (error.code !== "EEXIST") {
        throw error;
      }
    }
  }

  private getDatabaseConfig() {
    return {
      host: this.configService.get<string>("DB_HOST", "localhost"),
      port: this.configService.get<number>("DB_PORT", 5432),
      username: this.configService.get<string>("DB_USERNAME", "postgres"),
      password: this.configService.get<string>("DB_PASSWORD", "postgres"),
      database: this.configService.get<string>("DB_NAME", "streambuddy"),
    };
  }

  private buildPgDumpCommand(dbConfig: any, outputPath: string): string {
    const { host, port, username, password, database } = dbConfig;

    return `PGPASSWORD="${password}" pg_dump -h ${host} -p ${port} -U ${username} -d ${database} -f "${outputPath}" --verbose --no-password`;
  }

  private buildPgRestoreCommand(dbConfig: any, inputPath: string): string {
    const { host, port, username, password, database } = dbConfig;

    return `PGPASSWORD="${password}" psql -h ${host} -p ${port} -U ${username} -d ${database} -f "${inputPath}" --verbose --no-password`;
  }

  private async calculateChecksum(filePath: string): Promise<string> {
    return new Promise((resolve, reject) => {
      const hash = crypto.createHash("sha256");
      const stream = fs.createReadStream(filePath);

      stream.on("data", (data) => hash.update(data));
      stream.on("end", () => resolve(hash.digest("hex")));
      stream.on("error", reject);
    });
  }

  private formatBytes(bytes: number): string {
    const sizes = ["Bytes", "KB", "MB", "GB"];
    if (bytes === 0) return "0 Bytes";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  }

  private async cleanupOldBackups(): Promise<void> {
    const retentionDays = this.configService.get<number>(
      "DB_BACKUP_RETENTION_DAYS",
      30
    );
    const cutoffDate = new Date(
      Date.now() - retentionDays * 24 * 60 * 60 * 1000
    );

    const backups = await this.listBackups();
    const oldBackups = backups.filter(
      (backup) => backup.createdAt < cutoffDate
    );

    for (const backup of oldBackups) {
      try {
        await this.deleteBackup(backup.id);
        this.logger.log(`Cleaned up old backup: ${backup.filename}`);
      } catch (error) {
        this.logger.error(
          `Failed to cleanup backup: ${backup.filename}`,
          error
        );
      }
    }
  }
}
