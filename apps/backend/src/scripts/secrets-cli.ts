#!/usr/bin/env ts-node

import { NestFactory } from "@nestjs/core";
import { AppModule } from "../app.module";
import { SecretsManagerService } from "../common/services/secrets-manager.service";
import { SecretsValidationService } from "../common/services/secrets-validation.service";

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const secretsManager = app.get(SecretsManagerService);
  const secretsValidation = app.get(SecretsValidationService);

  const command = process.argv[2];
  const args = process.argv.slice(3);

  try {
    switch (command) {
      case "validate":
        await validateSecrets(secretsValidation);
        break;
      case "list":
        await listSecrets(secretsManager);
        break;
      case "generate":
        await generateSecret(secretsValidation, args);
        break;
      case "rotate":
        await rotateSecret(secretsManager, args);
        break;
      case "check":
        await checkSecrets(secretsManager, secretsValidation);
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

async function validateSecrets(secretsValidation: SecretsValidationService) {
  console.log("🔍 Validating secrets...\n");

  const result = secretsValidation.validateAllSecrets();

  if (result.isValid) {
    console.log("✅ All secrets are valid!");
  } else {
    console.log("❌ Validation failed:");
    result.errors.forEach((error) => console.log(`  - ${error}`));
  }

  if (result.warnings.length > 0) {
    console.log("\n⚠️  Warnings:");
    result.warnings.forEach((warning) => console.log(`  - ${warning}`));
  }

  console.log("\n📋 Detailed Results:");
  Object.entries(result.details).forEach(([key, detail]) => {
    const status = detail.isValid ? "✅" : "❌";
    console.log(`  ${status} ${key}`);
    if (detail.errors.length > 0) {
      detail.errors.forEach((error) => console.log(`    - ${error}`));
    }
    if (detail.warnings.length > 0) {
      detail.warnings.forEach((warning) => console.log(`    - ⚠️  ${warning}`));
    }
  });
}

async function listSecrets(secretsManager: SecretsManagerService) {
  console.log("📋 Listing secrets...\n");

  const secrets = secretsManager.listSecrets();

  if (secrets.length === 0) {
    console.log("No secrets found.");
    return;
  }

  console.log("Registered Secrets:");
  secrets.forEach((secret) => {
    const status =
      secret.expiresAt && secret.expiresAt < new Date()
        ? "❌ EXPIRED"
        : "✅ ACTIVE";
    const encrypted = secret.encrypted ? "🔒 ENCRYPTED" : "🔓 PLAIN";
    const lastRotated = secret.lastRotated
      ? `Last rotated: ${secret.lastRotated.toISOString().split("T")[0]}`
      : "Never rotated";

    console.log(`  ${secret.key}`);
    console.log(`    Status: ${status}`);
    console.log(`    Type: ${encrypted}`);
    console.log(`    ${lastRotated}`);
    if (secret.expiresAt) {
      console.log(
        `    Expires: ${secret.expiresAt.toISOString().split("T")[0]}`
      );
    }
    console.log("");
  });
}

async function generateSecret(
  secretsValidation: SecretsValidationService,
  args: string[]
) {
  if (args.length < 1) {
    console.error("Usage: npm run secrets:generate <type> [length]");
    console.error("Types: jwt, api-key, password, redis-password");
    process.exit(1);
  }

  const type = args[0];
  const length = args[1] ? parseInt(args[1]) : 32;

  console.log(`🔐 Generating ${type} secret (${length} characters)...\n`);

  const secret = secretsValidation.generateSecureSecret(type, length);

  console.log("Generated Secret:");
  console.log(`  ${secret}`);
  console.log("\n⚠️  Important:");
  console.log("  - Store this secret securely");
  console.log("  - Update your environment variables");
  console.log("  - Never commit secrets to version control");
}

async function rotateSecret(
  secretsManager: SecretsManagerService,
  args: string[]
) {
  if (args.length < 2) {
    console.error("Usage: npm run secrets:rotate <key> <new-value>");
    process.exit(1);
  }

  const key = args[0];
  const newValue = args[1];

  console.log(`🔄 Rotating secret: ${key}...\n`);

  const success = secretsManager.rotateSecret(key, newValue);

  if (success) {
    console.log(`✅ Successfully rotated secret: ${key}`);
  } else {
    console.log(`❌ Failed to rotate secret: ${key} (not found)`);
  }
}

async function checkSecrets(
  secretsManager: SecretsManagerService,
  secretsValidation: SecretsValidationService
) {
  console.log("🔍 Checking secrets health...\n");

  // Initialize secrets from environment
  secretsManager.initializeFromEnvironment();

  // Validate secrets
  const validationResult = secretsValidation.validateAllSecrets();

  // Check secrets manager validation
  const managerValidation = secretsManager.validateSecrets();

  console.log("📊 Secrets Health Report:");
  console.log(
    `  Validation: ${validationResult.isValid ? "✅ PASS" : "❌ FAIL"}`
  );
  console.log(
    `  Manager: ${managerValidation.isValid ? "✅ PASS" : "❌ FAIL"}`
  );

  if (!validationResult.isValid) {
    console.log("\n❌ Validation Errors:");
    validationResult.errors.forEach((error) => console.log(`  - ${error}`));
  }

  if (!managerValidation.isValid) {
    console.log("\n❌ Manager Errors:");
    managerValidation.errors.forEach((error) => console.log(`  - ${error}`));
  }

  if (
    validationResult.warnings.length > 0 ||
    managerValidation.warnings.length > 0
  ) {
    console.log("\n⚠️  Warnings:");
    [...validationResult.warnings, ...managerValidation.warnings].forEach(
      (warning) => console.log(`  - ${warning}`)
    );
  }

  if (validationResult.isValid && managerValidation.isValid) {
    console.log("\n🎉 All secrets are healthy!");
  }
}

function printUsage() {
  console.log("🔐 StreamBuddy Secrets Management CLI\n");
  console.log("Usage: npm run secrets:<command> [args]\n");
  console.log("Commands:");
  console.log("  validate     - Validate all secrets");
  console.log("  list         - List all registered secrets");
  console.log("  generate     - Generate a secure secret");
  console.log("  rotate       - Rotate a secret");
  console.log("  check        - Comprehensive secrets health check\n");
  console.log("Examples:");
  console.log("  npm run secrets:validate");
  console.log("  npm run secrets:generate jwt 64");
  console.log("  npm run secrets:rotate JWT_SECRET new-secret-value");
  console.log("  npm run secrets:check");
}

if (require.main === module) {
  bootstrap();
}
