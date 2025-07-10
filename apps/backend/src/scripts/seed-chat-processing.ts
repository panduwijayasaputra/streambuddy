#!/usr/bin/env ts-node

import { DataSource } from "typeorm";
import { config } from "dotenv";
import { runChatProcessingSeeds } from "../modules/chat-processing/seeds/run-seeds";

// Load environment variables
config();

async function seedChatProcessing() {
  const dataSource = new DataSource({
    type: "postgres",
    host: process.env.DB_HOST || "localhost",
    port: parseInt(process.env.DB_PORT || "5432"),
    username: process.env.DB_USERNAME || "postgres",
    password: process.env.DB_PASSWORD || "postgres",
    database: process.env.DB_NAME || "streambuddy",
    entities: [__dirname + "/../modules/chat-processing/entities/*.entity.ts"],
    synchronize: false,
    logging: true,
  });

  try {
    await dataSource.initialize();
    console.log("✅ Database connection established");

    // Run chat processing seeds
    await runChatProcessingSeeds(dataSource);

    console.log("🎉 Chat processing seeding completed successfully!");
  } catch (error) {
    console.error("❌ Error seeding chat processing:", error);
    process.exit(1);
  } finally {
    await dataSource.destroy();
  }
}

// Run the seed function
seedChatProcessing().catch(console.error);
