import { DataSource } from "typeorm";
import { responseTemplatesSeed } from "./response-templates.seed";
import { gameKnowledgeSeed } from "./game-knowledge.seed";

export const runChatProcessingSeeds = async (
  dataSource: DataSource
): Promise<void> => {
  console.log("🌱 Running chat processing seeds...");

  try {
    // Run response templates seed
    console.log("📝 Seeding response templates...");
    await responseTemplatesSeed(dataSource);
    console.log("✅ Response templates seeded successfully");

    // Run game knowledge seed
    console.log("🎮 Seeding game knowledge...");
    await gameKnowledgeSeed(dataSource);
    console.log("✅ Game knowledge seeded successfully");

    console.log("🎉 All chat processing seeds completed successfully!");
  } catch (error) {
    console.error("❌ Error running chat processing seeds:", error);
    throw error;
  }
};
