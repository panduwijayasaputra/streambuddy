#!/usr/bin/env ts-node

import { NestFactory } from "@nestjs/core";
import { AppModule } from "../app.module";
import { ContentFilterService } from "../modules/chat-processing/services/content-filter.service";

async function testContentFiltering() {
  console.log("🚀 Starting content filtering test...");

  try {
    // Create NestJS application
    const app = await NestFactory.createApplicationContext(AppModule);
    const contentFilterService = app.get(ContentFilterService);

    console.log("✅ Application context created");

    // Test cases for different scenarios
    const testCases = [
      // Valid gaming messages
      {
        message: "Bagaimana cara build hero ini?",
        username: "gamer123",
        expected: "valid",
      },
      {
        message: "What is the best strategy for this game?",
        username: "proplayer",
        expected: "valid",
      },
      { message: "GG! Nice play!", username: "newbie", expected: "valid" },
      {
        message: "Can you explain this mechanic?",
        username: "viewer",
        expected: "valid",
      },

      // Spam messages
      {
        message: "BUY NOW CLICK HERE FREE MONEY!!!",
        username: "spammer",
        expected: "spam",
      },
      {
        message: "www.freemoney.com click here",
        username: "adbot",
        expected: "spam",
      },
      {
        message: "follow me on discord for free hacks",
        username: "hacker",
        expected: "spam",
      },
      {
        message: "aaaaaaaaaaaaaaaaaaaaaaaa",
        username: "repeater",
        expected: "spam",
      },
      { message: "hi", username: "shorty", expected: "spam" }, // Too short
      { message: "a".repeat(600), username: "longy", expected: "spam" }, // Too long

      // Inappropriate messages (English)
      {
        message: "fuck you noob",
        username: "toxic1",
        expected: "inappropriate",
      },
      {
        message: "you are stupid",
        username: "toxic2",
        expected: "inappropriate",
      },
      {
        message: "kill yourself",
        username: "toxic3",
        expected: "inappropriate",
      },

      // Inappropriate messages (Indonesian)
      {
        message: "anjing kamu goblok",
        username: "toxic4",
        expected: "inappropriate",
      },
      {
        message: "bangsat kontol",
        username: "toxic5",
        expected: "inappropriate",
      },
      { message: "mati aja lu", username: "toxic6", expected: "inappropriate" },

      // Gaming toxic messages
      {
        message: "uninstall noob",
        username: "gamer1",
        expected: "inappropriate",
      },
      {
        message: "you are trash",
        username: "gamer2",
        expected: "inappropriate",
      },
      { message: "ez win", username: "gamer3", expected: "inappropriate" },

      // Obfuscated profanity
      {
        message: "f*ck you",
        username: "obfuscated1",
        expected: "inappropriate",
      },
      { message: "sh*t", username: "obfuscated2", expected: "inappropriate" },
      { message: "a*jing", username: "obfuscated3", expected: "inappropriate" },

      // Edge cases
      {
        message: "What is the best build for this hero?",
        username: "questioner",
        expected: "valid",
      },
      {
        message:
          "This is a very long and thoughtful message about gaming strategy",
        username: "thinker",
        expected: "valid",
      },
      { message: "gg", username: "shortgamer", expected: "valid" },
    ];

    console.log("📝 Testing individual message filtering...");
    let passed = 0;
    let failed = 0;

    for (const testCase of testCases) {
      const result = await contentFilterService.filterMessage(
        testCase.message,
        testCase.username
      );
      const actualReason = result.reason;
      const expectedReason = testCase.expected;

      if (actualReason === expectedReason) {
        passed++;
        console.log(`✅ PASS: "${testCase.message}" -> ${actualReason}`);
      } else {
        failed++;
        console.log(
          `❌ FAIL: "${testCase.message}" -> expected ${expectedReason}, got ${actualReason}`
        );
      }
    }

    console.log(
      `\n📊 Individual Test Results: ${passed} passed, ${failed} failed`
    );

    // Test priority scoring
    console.log("\n📈 Testing priority scoring...");
    const priorityTests = [
      {
        message: "What is the best build for this hero?",
        username: "gamer",
        expected: "high",
      },
      { message: "gg", username: "gamer", expected: "low" },
      { message: "fuck you", username: "toxic", expected: "zero" },
      { message: "BUY NOW FREE MONEY", username: "spammer", expected: "zero" },
    ];

    for (const test of priorityTests) {
      const result = await contentFilterService.filterMessage(
        test.message,
        test.username
      );
      const priority = result.priority;
      let priorityLevel = "medium";
      if (priority >= 7) priorityLevel = "high";
      else if (priority <= 2) priorityLevel = "low";
      else if (priority === 0) priorityLevel = "zero";

      console.log(
        `Priority for "${test.message}": ${priority} (${priorityLevel})`
      );
    }

    // Test gaming context detection
    console.log("\n🎮 Testing gaming context detection...");
    const gamingTests = [
      "How to build this hero?",
      "What is the meta?",
      "Best strategy for this game",
      "How to play this champion?",
      "What items should I buy?",
      "Hello world", // Non-gaming
      "How are you?", // Non-gaming
    ];

    for (const message of gamingTests) {
      const isGaming = await contentFilterService.isGamingRelated(message);
      console.log(`"${message}" -> Gaming related: ${isGaming}`);
    }

    // Test filter statistics
    console.log("\n📊 Testing filter statistics...");
    const testMessages = testCases.map((tc) => ({
      message: tc.message,
      username: tc.username,
    }));

    const stats = await contentFilterService.getFilterStatistics(testMessages);
    console.log("Filter Statistics:", {
      total: stats.total,
      filtered: stats.filtered,
      spam: stats.spam,
      inappropriate: stats.inappropriate,
      gamingRelated: stats.gamingRelated,
      averagePriority: stats.averagePriority.toFixed(2),
    });

    console.log("\n✅ All content filtering tests completed!");
    await app.close();
  } catch (error) {
    console.error("❌ Test failed:", error.message);
    process.exit(1);
  }
}

// Run the test
testContentFiltering().catch(console.error);
