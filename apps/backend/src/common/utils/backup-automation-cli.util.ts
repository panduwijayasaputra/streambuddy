#!/usr/bin/env node

import { NestFactory } from "@nestjs/core";
import { AppModule } from "../../app.module";
import { BackupAutomationService } from "../services/backup-automation.service";

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const automationService = app.get(BackupAutomationService);

  const command = process.argv[2];
  const args = process.argv.slice(3);

  try {
    switch (command) {
      case "config":
        await handleConfigCommand(automationService, args);
        break;
      case "execute":
        await handleExecuteCommand(automationService, args);
        break;
      case "events":
        await handleEventsCommand(automationService, args);
        break;
      case "statistics":
        await handleStatisticsCommand(automationService);
        break;
      case "health":
        await handleHealthCommand(automationService);
        break;
      case "test":
        await handleTestCommand(automationService);
        break;
      default:
        printUsage();
    }
  } catch (error) {
    console.error("Error:", error.message);
    process.exit(1);
  } finally {
    await app.close();
  }
}

async function handleConfigCommand(
  automationService: BackupAutomationService,
  args: string[]
) {
  if (args.length === 0) {
    const config = automationService.getAutomationConfig();
    console.log("Current backup automation configuration:");
    console.log(JSON.stringify(config, null, 2));
    return;
  }

  const subCommand = args[0];
  switch (subCommand) {
    case "update":
      if (args.length < 3) {
        console.error("Usage: config update <key> <value>");
        return;
      }
      const key = args[1];
      const value = parseValue(args[2]);
      automationService.updateAutomationConfig({ [key]: value });
      console.log(`Updated ${key} to ${value}`);
      break;
    default:
      console.error("Unknown config subcommand:", subCommand);
  }
}

async function handleExecuteCommand(
  automationService: BackupAutomationService,
  args: string[]
) {
  const scheduleId = args[0];
  const event = await automationService.executeAutomatedBackup(scheduleId);
  console.log("Backup execution result:");
  console.log(JSON.stringify(event, null, 2));
}

async function handleEventsCommand(
  automationService: BackupAutomationService,
  args: string[]
) {
  const events = automationService.getAutomationEvents();

  if (args.length === 0) {
    console.log("Recent backup automation events:");
    events.slice(-10).forEach((event) => {
      console.log(
        `${event.id}: ${event.status} (${event.type}) - ${event.timestamp.toISOString()}`
      );
    });
    return;
  }

  const subCommand = args[0];
  switch (subCommand) {
    case "clear":
      automationService.clearEventHistory();
      console.log("Event history cleared");
      break;
    case "details":
      if (args.length < 2) {
        console.error("Usage: events details <eventId>");
        return;
      }
      const eventId = args[1];
      const event = events.find((e) => e.id === eventId);
      if (event) {
        console.log("Event details:");
        console.log(JSON.stringify(event, null, 2));
      } else {
        console.error("Event not found:", eventId);
      }
      break;
    default:
      console.error("Unknown events subcommand:", subCommand);
  }
}

async function handleStatisticsCommand(
  automationService: BackupAutomationService
) {
  const stats = await automationService.getAutomationStatistics();
  console.log("Backup automation statistics:");
  console.log(JSON.stringify(stats, null, 2));
}

async function handleHealthCommand(automationService: BackupAutomationService) {
  const config = automationService.getAutomationConfig();
  const activeBackups = automationService.getActiveBackups();

  console.log("Backup automation health:");
  console.log(`- Enabled: ${config.enabled}`);
  console.log(`- Active backups: ${activeBackups.length}`);
  console.log(`- Configuration: ${JSON.stringify(config, null, 2)}`);
}

async function handleTestCommand(automationService: BackupAutomationService) {
  console.log("Testing backup automation...");
  const event = await automationService.executeAutomatedBackup();
  console.log("Test completed:");
  console.log(JSON.stringify(event, null, 2));
}

function parseValue(value: string): any {
  if (value === "true") return true;
  if (value === "false") return false;
  if (!isNaN(Number(value))) return Number(value);
  return value;
}

function printUsage() {
  console.log(`
Backup Automation CLI

Usage: npm run backup:automation <command> [args]

Commands:
  config                    Show current configuration
  config update <key> <value>  Update configuration
  execute [scheduleId]      Execute backup (optional schedule ID)
  events                    Show recent events
  events clear              Clear event history
  events details <eventId>  Show event details
  statistics                Show automation statistics
  health                    Show automation health
  test                      Test backup automation

Examples:
  npm run backup:automation config
  npm run backup:automation config update enabled true
  npm run backup:automation execute daily-backup
  npm run backup:automation events
  npm run backup:automation test
`);
}

if (require.main === module) {
  bootstrap();
}
