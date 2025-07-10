import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
} from "@nestjs/common";
import {
  BackupAutomationService,
  BackupAutomationConfig,
  BackupAutomationEvent,
} from "../services/backup-automation.service";

@Controller("api/backup-automation")
export class BackupAutomationController {
  constructor(private readonly automationService: BackupAutomationService) {}

  @Get("config")
  getAutomationConfig(): BackupAutomationConfig {
    return this.automationService.getAutomationConfig();
  }

  @Put("config")
  updateAutomationConfig(@Body() config: Partial<BackupAutomationConfig>): {
    message: string;
  } {
    this.automationService.updateAutomationConfig(config);
    return { message: "Backup automation configuration updated successfully" };
  }

  @Post("execute")
  async executeBackup(
    @Body() body: { scheduleId?: string }
  ): Promise<BackupAutomationEvent> {
    return this.automationService.executeAutomatedBackup(body.scheduleId);
  }

  @Get("events")
  getAutomationEvents(
    @Query("limit") limit?: number,
    @Query("status") status?: string,
    @Query("type") type?: string
  ): BackupAutomationEvent[] {
    let events = this.automationService.getAutomationEvents();

    // Filter by status
    if (status) {
      events = events.filter((event) => event.status === status);
    }

    // Filter by type
    if (type) {
      events = events.filter((event) => event.type === type);
    }

    // Apply limit
    if (limit && limit > 0) {
      events = events.slice(0, limit);
    }

    return events;
  }

  @Get("events/:eventId")
  getAutomationEvent(
    @Param("eventId") eventId: string
  ): BackupAutomationEvent | null {
    const events = this.automationService.getAutomationEvents();
    return events.find((event) => event.id === eventId) || null;
  }

  @Get("active")
  getActiveBackups(): { activeBackups: string[] } {
    return {
      activeBackups: this.automationService.getActiveBackups(),
    };
  }

  @Get("statistics")
  async getAutomationStatistics(): Promise<{
    totalEvents: number;
    successfulEvents: number;
    failedEvents: number;
    successRate: number;
    averageDuration: number;
    activeBackups: number;
  }> {
    return this.automationService.getAutomationStatistics();
  }

  @Delete("events")
  clearEventHistory(): { message: string } {
    this.automationService.clearEventHistory();
    return { message: "Backup automation event history cleared successfully" };
  }

  @Get("health")
  async getAutomationHealth(): Promise<{
    status: "healthy" | "warning" | "critical";
    issues: string[];
    config: BackupAutomationConfig;
    activeBackups: number;
  }> {
    const config = this.automationService.getAutomationConfig();
    const activeBackups = this.automationService.getActiveBackups().length;
    const statistics = await this.automationService.getAutomationStatistics();

    const issues: string[] = [];

    // Check if automation is enabled
    if (!config.enabled) {
      issues.push("Backup automation is disabled");
    }

    // Check for too many active backups
    if (activeBackups >= config.conditions.maxConcurrentBackups) {
      issues.push(`Too many active backups: ${activeBackups}`);
    }

    // Check success rate
    if (statistics.successRate < 80) {
      issues.push(`Low success rate: ${statistics.successRate.toFixed(2)}%`);
    }

    // Check average duration
    if (statistics.averageDuration > 300000) {
      // 5 minutes
      issues.push(
        `High average backup duration: ${(statistics.averageDuration / 1000).toFixed(2)}s`
      );
    }

    let status: "healthy" | "warning" | "critical" = "healthy";
    if (issues.length > 0) {
      status = issues.some(
        (issue) =>
          issue.includes("disabled") ||
          issue.includes("Too many active backups")
      )
        ? "critical"
        : "warning";
    }

    return {
      status,
      issues,
      config,
      activeBackups,
    };
  }

  @Post("test")
  async testAutomation(): Promise<{
    message: string;
    testEvent: BackupAutomationEvent;
  }> {
    const testEvent = await this.automationService.executeAutomatedBackup();
    return {
      message: "Backup automation test completed",
      testEvent,
    };
  }
}
