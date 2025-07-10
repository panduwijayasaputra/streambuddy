import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as crypto from "crypto";

export interface SecretConfig {
  key: string;
  value: string;
  encrypted: boolean;
  lastRotated?: Date;
  expiresAt?: Date;
}

export interface SecretValidation {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

@Injectable()
export class SecretsManagerService {
  private readonly logger = new Logger(SecretsManagerService.name);
  private readonly secrets = new Map<string, SecretConfig>();
  private readonly encryptionKey: string;

  constructor(private readonly configService: ConfigService) {
    this.encryptionKey =
      this.configService.get<string>("SECRETS_ENCRYPTION_KEY") ||
      this.generateEncryptionKey();
  }

  /**
   * Register a secret with the secrets manager
   */
  registerSecret(
    key: string,
    value: string,
    options: {
      encrypted?: boolean;
      expiresAt?: Date;
    } = {}
  ): void {
    const secret: SecretConfig = {
      key,
      value: options.encrypted ? this.encrypt(value) : value,
      encrypted: options.encrypted || false,
      lastRotated: new Date(),
      expiresAt: options.expiresAt,
    };

    this.secrets.set(key, secret);
    this.logger.log(`Secret registered: ${key}`);
  }

  /**
   * Get a secret value
   */
  getSecret(key: string): string | null {
    const secret = this.secrets.get(key);
    if (!secret) {
      this.logger.warn(`Secret not found: ${key}`);
      return null;
    }

    if (secret.expiresAt && secret.expiresAt < new Date()) {
      this.logger.warn(`Secret expired: ${key}`);
      return null;
    }

    return secret.encrypted ? this.decrypt(secret.value) : secret.value;
  }

  /**
   * Rotate a secret
   */
  rotateSecret(key: string, newValue: string): boolean {
    const secret = this.secrets.get(key);
    if (!secret) {
      this.logger.error(`Cannot rotate secret: ${key} not found`);
      return false;
    }

    secret.value = secret.encrypted ? this.encrypt(newValue) : newValue;
    secret.lastRotated = new Date();

    this.logger.log(`Secret rotated: ${key}`);
    return true;
  }

  /**
   * Validate all secrets
   */
  validateSecrets(): SecretValidation {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check for required secrets
    const requiredSecrets = ["OPENAI_API_KEY", "JWT_SECRET", "DB_PASSWORD"];

    for (const requiredSecret of requiredSecrets) {
      if (!this.getSecret(requiredSecret)) {
        errors.push(`Required secret missing: ${requiredSecret}`);
      }
    }

    // Check for expired secrets
    for (const [key, secret] of this.secrets.entries()) {
      if (secret.expiresAt && secret.expiresAt < new Date()) {
        errors.push(`Secret expired: ${key}`);
      }

      // Check for secrets that haven't been rotated recently
      if (secret.lastRotated) {
        const daysSinceRotation =
          (Date.now() - secret.lastRotated.getTime()) / (1000 * 60 * 60 * 24);
        if (daysSinceRotation > 90) {
          warnings.push(
            `Secret should be rotated: ${key} (${Math.floor(daysSinceRotation)} days old)`
          );
        }
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * List all secrets (without values)
   */
  listSecrets(): Array<{
    key: string;
    encrypted: boolean;
    lastRotated?: Date;
    expiresAt?: Date;
  }> {
    return Array.from(this.secrets.entries()).map(([key, secret]) => ({
      key,
      encrypted: secret.encrypted,
      lastRotated: secret.lastRotated,
      expiresAt: secret.expiresAt,
    }));
  }

  /**
   * Remove a secret
   */
  removeSecret(key: string): boolean {
    const removed = this.secrets.delete(key);
    if (removed) {
      this.logger.log(`Secret removed: ${key}`);
    }
    return removed;
  }

  /**
   * Encrypt a value
   */
  private encrypt(value: string): string {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipher("aes-256-cbc", this.encryptionKey);
    let encrypted = cipher.update(value, "utf8", "hex");
    encrypted += cipher.final("hex");
    return iv.toString("hex") + ":" + encrypted;
  }

  /**
   * Decrypt a value
   */
  private decrypt(encryptedValue: string): string {
    const parts = encryptedValue.split(":");
    const iv = Buffer.from(parts[0], "hex");
    const encrypted = parts[1];
    const decipher = crypto.createDecipher("aes-256-cbc", this.encryptionKey);
    let decrypted = decipher.update(encrypted, "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  }

  /**
   * Generate a new encryption key
   */
  private generateEncryptionKey(): string {
    return crypto.randomBytes(32).toString("hex");
  }

  /**
   * Initialize secrets from environment variables
   */
  initializeFromEnvironment(): void {
    const envSecrets = [
      "OPENAI_API_KEY",
      "JWT_SECRET",
      "DB_PASSWORD",
      "REDIS_PASSWORD",
      "TWITCH_CLIENT_SECRET",
      "YOUTUBE_CLIENT_SECRET",
      "DISCORD_CLIENT_SECRET",
    ];

    for (const secretKey of envSecrets) {
      const value = this.configService.get<string>(secretKey);
      if (value) {
        this.registerSecret(secretKey, value, { encrypted: true });
      }
    }
  }
}
