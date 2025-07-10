#!/usr/bin/env ts-node

import { NestFactory } from "@nestjs/core";
import { AppModule } from "../app.module";
import { ChatMessageService } from "../modules/chat-processing/services/chat-message.service";
import { CreateChatMessageDto } from "../modules/chat-processing/dto/chat-message.dto";

async function testChatIngestion() {
  console.log("🚀 Starting chat ingestion test...");

  try {
    // Create NestJS application
    const app = await NestFactory.createApplicationContext(AppModule);
    const chatMessageService = app.get(ChatMessageService);

    console.log("✅ Application context created");

    // Test data
    const testMessages: CreateChatMessageDto[] = [
      {
        streamSessionId: "test-session-1",
        platform: "twitch",
        userId: "user1",
        username: "gamer123",
        message: "Bagaimana cara build hero ini?",
      },
      {
        streamSessionId: "test-session-1",
        platform: "twitch",
        userId: "user2",
        username: "proplayer",
        message: "What is the best strategy for this game?",
      },
      {
        streamSessionId: "test-session-1",
        platform: "twitch",
        userId: "user3",
        username: "newbie",
        message: "GG! Nice play!",
      },
      {
        streamSessionId: "test-session-2",
        platform: "youtube",
        userId: "user4",
        username: "viewer",
        message: "Can you explain this mechanic?",
      },
    ];

    console.log("📝 Testing single message ingestion...");
    const singleMessage = await chatMessageService.processChatMessage(
      testMessages[0]
    );
    console.log("✅ Single message processed:", {
      id: singleMessage.id,
      username: singleMessage.username,
      status: singleMessage.status,
      gameContext: singleMessage.metadata?.gameContext,
    });

    console.log("📝 Testing bulk message ingestion...");
    const bulkMessages = await chatMessageService.bulkInsertMessages(
      testMessages.slice(1)
    );
    console.log("✅ Bulk messages processed:", bulkMessages.length);

    console.log("📊 Testing analytics...");
    const analytics =
      await chatMessageService.getMessageAnalytics("test-session-1");
    console.log("✅ Analytics retrieved:", {
      totalMessages: analytics.totalMessages,
      uniqueUsers: analytics.uniqueUsers,
      topGameContexts: analytics.topGameContexts,
    });

    console.log("📈 Testing statistics...");
    const stats =
      await chatMessageService.getMessageStatistics("test-session-1");
    console.log("✅ Statistics retrieved:", stats);

    console.log("🔍 Testing recent messages...");
    const recentMessages = await chatMessageService.getRecentMessages(
      "test-session-1",
      5
    );
    console.log("✅ Recent messages retrieved:", recentMessages.length);

    console.log("🎮 Testing game context filtering...");
    const gameMessages = await chatMessageService.getMessagesByGameContext(
      "test-session-1",
      "Mobile Legends",
      10
    );
    console.log("✅ Game context messages retrieved:", gameMessages.length);

    console.log("✅ All tests passed successfully!");
    await app.close();
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    process.exit(1);
  }
}

// Run the test
testChatIngestion().catch(console.error);
