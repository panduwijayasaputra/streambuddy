import { DataSource } from "typeorm";
import { ConfigService } from "@nestjs/config";
import { createDatabaseConfig } from "../../../config/database.config";
import { GamesSeed } from "./games.seed";
import { UsersSeed } from "./users.seed";
import { UserGamesSeed } from "./user-games.seed";

async function runSeeds() {
  console.log("🌱 Starting database seeding...\n");

  // Create database connection
  const configService = new ConfigService();
  const dataSource = new DataSource(createDatabaseConfig(configService));

  try {
    await dataSource.initialize();
    console.log("✅ Database connection established\n");

    // Run seeds in order
    const gamesSeed = new GamesSeed(dataSource);
    await gamesSeed.run();
    console.log("");

    const usersSeed = new UsersSeed(dataSource);
    await usersSeed.run();
    console.log("");

    const userGamesSeed = new UserGamesSeed(dataSource);
    await userGamesSeed.run();
    console.log("");

    console.log("🎉 All seeds completed successfully!");
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
  }
}

// Run if called directly
if (require.main === module) {
  runSeeds();
}

export { runSeeds };
