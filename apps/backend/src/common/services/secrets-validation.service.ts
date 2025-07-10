import { Injectable, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

export interface ValidationRule {
  name: string;
  validate: (value: string) => boolean;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
  details: Record<
    string,
    { isValid: boolean; errors: string[]; warnings: string[] }
  >;
}

@Injectable()
export class SecretsValidationService {
  private readonly logger = new Logger(SecretsValidationService.name);
  private readonly validationRules: Map<string, ValidationRule[]> = new Map();

  constructor(private readonly configService: ConfigService) {
    this.initializeValidationRules();
  }

  /**
   * Initialize validation rules for different types of secrets
   */
  private initializeValidationRules(): void {
    // OpenAI API Key validation
    this.validationRules.set("OPENAI_API_KEY", [
      {
        name: "format",
        validate: (value: string) => value.startsWith("sk-"),
        message: 'OpenAI API key must start with "sk-"',
      },
      {
        name: "length",
        validate: (value: string) => value.length >= 20,
        message: "OpenAI API key must be at least 20 characters long",
      },
    ]);

    // JWT Secret validation
    this.validationRules.set("JWT_SECRET", [
      {
        name: "length",
        validate: (value: string) => value.length >= 32,
        message: "JWT secret must be at least 32 characters long",
      },
      {
        name: "complexity",
        validate: (value: string) =>
          /[A-Z]/.test(value) && /[a-z]/.test(value) && /[0-9]/.test(value),
        message: "JWT secret must contain uppercase, lowercase, and numbers",
      },
    ]);

    // Database Password validation
    this.validationRules.set("DB_PASSWORD", [
      {
        name: "length",
        validate: (value: string) => value.length >= 8,
        message: "Database password must be at least 8 characters long",
      },
      {
        name: "complexity",
        validate: (value: string) =>
          /[A-Z]/.test(value) && /[a-z]/.test(value) && /[0-9]/.test(value),
        message:
          "Database password must contain uppercase, lowercase, and numbers",
      },
    ]);

    // Redis Password validation
    this.validationRules.set("REDIS_PASSWORD", [
      {
        name: "length",
        validate: (value: string) => value.length >= 6,
        message: "Redis password must be at least 6 characters long",
      },
    ]);

    // Twitch Client Secret validation
    this.validationRules.set("TWITCH_CLIENT_SECRET", [
      {
        name: "format",
        validate: (value: string) => /^[a-zA-Z0-9]{30,}$/.test(value),
        message:
          "Twitch client secret must be alphanumeric and at least 30 characters",
      },
    ]);

    // YouTube Client Secret validation
    this.validationRules.set("YOUTUBE_CLIENT_SECRET", [
      {
        name: "format",
        validate: (value: string) => /^[a-zA-Z0-9_-]{20,}$/.test(value),
        message:
          "YouTube client secret must be alphanumeric with hyphens/underscores and at least 20 characters",
      },
    ]);

    // Discord Client Secret validation
    this.validationRules.set("DISCORD_CLIENT_SECRET", [
      {
        name: "format",
        validate: (value: string) => /^[a-zA-Z0-9]{32}$/.test(value),
        message:
          "Discord client secret must be exactly 32 alphanumeric characters",
      },
    ]);
  }

  /**
   * Validate a specific secret
   */
  validateSecret(
    key: string,
    value: string
  ): { isValid: boolean; errors: string[]; warnings: string[] } {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Check if value exists
    if (!value || value.trim() === "") {
      errors.push(`${key} is empty or not set`);
      return { isValid: false, errors, warnings };
    }

    // Check for common security issues
    if (this.isCommonPassword(value)) {
      warnings.push(`${key} appears to be a common password`);
    }

    if (this.isWeakSecret(value)) {
      warnings.push(`${key} appears to be weak (too short or simple)`);
    }

    // Apply specific validation rules
    const rules = this.validationRules.get(key);
    if (rules) {
      for (const rule of rules) {
        if (!rule.validate(value)) {
          errors.push(`${key}: ${rule.message}`);
        }
      }
    }

    // Check for environment-specific issues
    if (this.configService.get("NODE_ENV") === "production") {
      if (this.isTestValue(value)) {
        errors.push(`${key} contains test/development value in production`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
    };
  }

  /**
   * Validate all secrets from environment
   */
  validateAllSecrets(): ValidationResult {
    const secretsToValidate = [
      "OPENAI_API_KEY",
      "JWT_SECRET",
      "DB_PASSWORD",
      "REDIS_PASSWORD",
      "TWITCH_CLIENT_SECRET",
      "YOUTUBE_CLIENT_SECRET",
      "DISCORD_CLIENT_SECRET",
    ];

    const details: Record<
      string,
      { isValid: boolean; errors: string[]; warnings: string[] }
    > = {};
    const allErrors: string[] = [];
    const allWarnings: string[] = [];

    for (const secretKey of secretsToValidate) {
      const value = this.configService.get<string>(secretKey);
      const result = this.validateSecret(secretKey, value || "");

      details[secretKey] = result;
      allErrors.push(...result.errors);
      allWarnings.push(...result.warnings);
    }

    return {
      isValid: allErrors.length === 0,
      errors: allErrors,
      warnings: allWarnings,
      details,
    };
  }

  /**
   * Check if a value is a common password
   */
  private isCommonPassword(value: string): boolean {
    const commonPasswords = [
      "password",
      "123456",
      "admin",
      "root",
      "test",
      "secret",
      "password123",
      "admin123",
      "test123",
      "secret123",
    ];
    return commonPasswords.includes(value.toLowerCase());
  }

  /**
   * Check if a secret is weak
   */
  private isWeakSecret(value: string): boolean {
    return (
      value.length < 8 ||
      !/[A-Z]/.test(value) ||
      !/[a-z]/.test(value) ||
      !/[0-9]/.test(value)
    );
  }

  /**
   * Check if a value appears to be a test value
   */
  private isTestValue(value: string): boolean {
    const testPatterns = [
      /test/i,
      /dev/i,
      /development/i,
      /staging/i,
      /example/i,
      /sample/i,
      /dummy/i,
      /fake/i,
      /sk-test/,
      /sk-dev/,
      /test-key/,
      /dev-key/,
    ];

    return testPatterns.some((pattern) => pattern.test(value));
  }

  /**
   * Generate a secure random secret
   */
  generateSecureSecret(type: string, length: number = 32): string {
    const charset =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*";
    let result = "";

    for (let i = 0; i < length; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    this.logger.log(`Generated secure ${type} secret`);
    return result;
  }

  /**
   * Get validation rules for a specific secret type
   */
  getValidationRules(key: string): ValidationRule[] {
    return this.validationRules.get(key) || [];
  }

  /**
   * Add custom validation rule
   */
  addValidationRule(key: string, rule: ValidationRule): void {
    if (!this.validationRules.has(key)) {
      this.validationRules.set(key, []);
    }
    this.validationRules.get(key)!.push(rule);
  }
}
