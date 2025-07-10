# StreamBuddy Secrets Management

This document describes the secrets management system for the StreamBuddy project, including API keys, passwords, and other sensitive configuration.

## 🔐 Overview

The secrets management system provides:

- **Secure storage** of API keys and secrets
- **Validation** of secret formats and strength
- **Rotation** capabilities for security
- **CLI tools** for management
- **Encryption** of sensitive values
- **Health monitoring** of secrets

## 📁 Architecture

```
apps/backend/src/common/
├── services/
│   ├── secrets-manager.service.ts      # Core secrets management
│   └── secrets-validation.service.ts   # Validation and security checks
├── modules/
│   └── secrets.module.ts              # Module organization
└── scripts/
    └── secrets-cli.ts                 # CLI management tools
```

## 🚀 Quick Start

### 1. Validate Secrets

```bash
# Check all secrets for validity
npm run secrets:validate

# Comprehensive health check
npm run secrets:check
```

### 2. Generate Secure Secrets

```bash
# Generate JWT secret
npm run secrets:generate jwt 64

# Generate API key
npm run secrets:generate api-key 32

# Generate database password
npm run secrets:generate password 16
```

### 3. List Secrets

```bash
# List all registered secrets
npm run secrets:list
```

### 4. Rotate Secrets

```bash
# Rotate a secret
npm run secrets:rotate JWT_SECRET new-secret-value
```

## 🔧 Services

### SecretsManagerService

**Purpose**: Core secrets management with encryption and rotation.

**Key Features**:

- **Encryption**: AES-256-CBC encryption for sensitive values
- **Rotation**: Secure secret rotation with audit trail
- **Expiration**: Automatic expiration handling
- **Validation**: Health checks and validation

**Methods**:

```typescript
// Register a secret
registerSecret(key: string, value: string, options?: {
  encrypted?: boolean;
  expiresAt?: Date;
}): void

// Get a secret value
getSecret(key: string): string | null

// Rotate a secret
rotateSecret(key: string, newValue: string): boolean

// Validate all secrets
validateSecrets(): SecretValidation

// List all secrets (metadata only)
listSecrets(): Array<SecretMetadata>
```

### SecretsValidationService

**Purpose**: Comprehensive validation and security checks.

**Key Features**:

- **Format validation**: Check secret formats (OpenAI, JWT, etc.)
- **Strength validation**: Ensure secrets meet security requirements
- **Common password detection**: Identify weak passwords
- **Environment-specific checks**: Production vs development validation

**Validation Rules**:

| Secret Type           | Format              | Length           | Complexity                    |
| --------------------- | ------------------- | ---------------- | ----------------------------- |
| OpenAI API Key        | `sk-` prefix        | ≥20 chars        | -                             |
| JWT Secret            | -                   | ≥32 chars        | Uppercase, lowercase, numbers |
| Database Password     | -                   | ≥8 chars         | Uppercase, lowercase, numbers |
| Redis Password        | -                   | ≥6 chars         | -                             |
| Twitch Client Secret  | Alphanumeric        | ≥30 chars        | -                             |
| YouTube Client Secret | Alphanumeric + `-_` | ≥20 chars        | -                             |
| Discord Client Secret | Alphanumeric        | Exactly 32 chars | -                             |

## 🛠️ CLI Commands

### Validation Commands

```bash
# Validate all secrets
npm run secrets:validate

# Comprehensive health check
npm run secrets:check
```

**Output Example**:

```
🔍 Validating secrets...

✅ All secrets are valid!

📋 Detailed Results:
  ✅ OPENAI_API_KEY
  ✅ JWT_SECRET
  ✅ DB_PASSWORD
  ✅ REDIS_PASSWORD
```

### Generation Commands

```bash
# Generate JWT secret (64 characters)
npm run secrets:generate jwt 64

# Generate API key (32 characters)
npm run secrets:generate api-key 32

# Generate password (16 characters)
npm run secrets:generate password 16
```

**Output Example**:

```
🔐 Generating jwt secret (64 characters)...

Generated Secret:
  K8mN2pQ9vX7wL4rT6yU1iO5aE3sD0fG8hJ2kM4nP6qR8tV0wX2yZ4aB6cD8eF

⚠️  Important:
  - Store this secret securely
  - Update your environment variables
  - Never commit secrets to version control
```

### Management Commands

```bash
# List all secrets
npm run secrets:list

# Rotate a secret
npm run secrets:rotate JWT_SECRET new-secret-value
```

## 🔒 Security Features

### Encryption

- **Algorithm**: AES-256-CBC
- **Key Management**: Environment-based encryption key
- **IV Generation**: Random initialization vectors
- **Storage**: Encrypted values in memory only

### Validation

- **Format Checking**: Validate secret formats
- **Strength Testing**: Ensure minimum security requirements
- **Common Password Detection**: Identify weak passwords
- **Environment Awareness**: Production vs development checks

### Rotation

- **Audit Trail**: Track rotation history
- **Secure Rotation**: Encrypted storage during rotation
- **Expiration Handling**: Automatic expiration checks

## 📊 Health Monitoring

### Validation Checks

1. **Required Secrets**: Ensure all required secrets are present
2. **Format Validation**: Check secret formats match expected patterns
3. **Strength Validation**: Verify secrets meet security requirements
4. **Expiration Checks**: Identify expired secrets
5. **Rotation History**: Flag old secrets for rotation

### Health Report

```bash
npm run secrets:check
```

**Output Example**:

```
🔍 Checking secrets health...

📊 Secrets Health Report:
  Validation: ✅ PASS
  Manager: ✅ PASS

🎉 All secrets are healthy!
```

## 🔧 Configuration

### Environment Variables

Add to your `.env` file:

```bash
# Secrets Management
SECRETS_ENCRYPTION_KEY=your-encryption-key-here
SECRETS_VALIDATION_ENABLED=true
SECRETS_ROTATION_ENABLED=true
SECRETS_EXPIRATION_ENABLED=true
```

### Required Secrets

The system expects these secrets to be configured:

```bash
# Core Secrets
OPENAI_API_KEY=sk-your-openai-key
JWT_SECRET=your-jwt-secret-here
DB_PASSWORD=your-database-password

# Optional Secrets
REDIS_PASSWORD=your-redis-password
TWITCH_CLIENT_SECRET=your-twitch-secret
YOUTUBE_CLIENT_SECRET=your-youtube-secret
DISCORD_CLIENT_SECRET=your-discord-secret
```

## 🚨 Security Best Practices

### 1. Secret Storage

- ✅ Store secrets in environment variables
- ✅ Use encrypted storage for sensitive values
- ✅ Never commit secrets to version control
- ✅ Rotate secrets regularly (90 days recommended)

### 2. Secret Generation

- ✅ Use the CLI to generate secure secrets
- ✅ Ensure minimum length requirements
- ✅ Include complexity requirements
- ✅ Use cryptographically secure random generation

### 3. Secret Validation

- ✅ Validate all secrets on startup
- ✅ Check for common passwords
- ✅ Verify format requirements
- ✅ Monitor for expiration

### 4. Secret Rotation

- ✅ Rotate secrets regularly
- ✅ Use secure rotation procedures
- ✅ Maintain audit trails
- ✅ Test rotation procedures

## 🔍 Troubleshooting

### Common Issues

1. **Missing Required Secrets**

   ```
   ❌ Validation failed:
     - Required secret missing: OPENAI_API_KEY
   ```

   **Solution**: Add missing secrets to environment variables

2. **Weak Secrets**

   ```
   ⚠️  Warnings:
     - JWT_SECRET appears to be weak (too short or simple)
   ```

   **Solution**: Generate a stronger secret using the CLI

3. **Expired Secrets**

   ```
   ❌ Validation failed:
     - Secret expired: API_KEY_1
   ```

   **Solution**: Rotate the expired secret

4. **Format Validation Errors**
   ```
   ❌ Validation failed:
     - OpenAI API key must start with "sk-"
   ```
   **Solution**: Check the secret format and update if needed

### Debug Commands

```bash
# Check secrets health
npm run secrets:check

# Validate specific secrets
npm run secrets:validate

# List all secrets
npm run secrets:list
```

## 📚 Integration

### With NestJS

```typescript
import { SecretsManagerService } from "./common/services/secrets-manager.service";
import { SecretsValidationService } from "./common/services/secrets-validation.service";

@Injectable()
export class MyService {
  constructor(
    private readonly secretsManager: SecretsManagerService,
    private readonly secretsValidation: SecretsValidationService
  ) {}

  async initialize() {
    // Initialize secrets from environment
    this.secretsManager.initializeFromEnvironment();

    // Validate secrets
    const validation = this.secretsValidation.validateAllSecrets();
    if (!validation.isValid) {
      throw new Error("Secrets validation failed");
    }
  }

  async getApiKey() {
    return this.secretsManager.getSecret("OPENAI_API_KEY");
  }
}
```

### With Health Checks

```typescript
import { Injectable } from "@nestjs/common";
import { HealthIndicatorResult, HealthCheckError } from "@nestjs/terminus";
import { SecretsValidationService } from "./secrets-validation.service";

@Injectable()
export class SecretsHealthIndicator {
  constructor(private readonly secretsValidation: SecretsValidationService) {}

  async isHealthy(): Promise<HealthIndicatorResult> {
    const validation = this.secretsValidation.validateAllSecrets();

    if (validation.isValid) {
      return {
        secrets: {
          status: "up",
          details: {
            total: Object.keys(validation.details).length,
            valid: Object.values(validation.details).filter((d) => d.isValid)
              .length,
            warnings: validation.warnings.length,
          },
        },
      };
    }

    throw new HealthCheckError("Secrets check failed", {
      secrets: {
        status: "down",
        errors: validation.errors,
        warnings: validation.warnings,
      },
    });
  }
}
```

## 🔄 Migration Guide

### From Environment Variables Only

1. **Install the secrets management system**
2. **Initialize secrets from environment**:
   ```typescript
   secretsManager.initializeFromEnvironment();
   ```
3. **Validate existing secrets**:
   ```bash
   npm run secrets:validate
   ```
4. **Generate new secrets if needed**:
   ```bash
   npm run secrets:generate jwt 64
   ```

### From External Secret Management

1. **Configure external secret provider**
2. **Create adapter for secrets manager**
3. **Initialize from external source**
4. **Validate and monitor secrets**

## 📈 Monitoring and Alerting

### Health Checks

- **Startup validation**: Validate all secrets on application startup
- **Periodic checks**: Regular health checks during runtime
- **Rotation monitoring**: Track secret rotation schedules
- **Expiration alerts**: Alert on expiring secrets

### Metrics

- **Secret count**: Total number of managed secrets
- **Validation status**: Success/failure rates
- **Rotation frequency**: How often secrets are rotated
- **Expiration tracking**: Time until secret expiration

### Alerts

- **Missing secrets**: Alert when required secrets are missing
- **Weak secrets**: Alert on weak or common passwords
- **Expired secrets**: Alert on expired secrets
- **Rotation due**: Alert when secrets need rotation

---

**Note**: Always follow security best practices and never expose secrets in logs, error messages, or version control. Use the provided CLI tools for secure secret management.
