import { ConfigService } from "@nestjs/config";

export const createOpenAIConfig = (configService: ConfigService) => ({
  apiKey: configService.get("OPENAI_API_KEY"),
  organization: configService.get("OPENAI_ORG_ID"),
  maxRetries: parseInt(configService.get("OPENAI_MAX_RETRIES", "3")),
  timeout: parseInt(configService.get("OPENAI_TIMEOUT", "30000")),
  model: configService.get("OPENAI_MODEL", "gpt-4"),
  temperature: configService.get("OPENAI_TEMPERATURE", 0.7),
  maxTokens: configService.get("OPENAI_MAX_TOKENS", 1000),
});

export const createRateLimitConfig = (configService: ConfigService) => ({
  ttl: configService.get("RATE_LIMIT_TTL", 60),
  limit: configService.get("RATE_LIMIT_LIMIT", 100),
  windowMs: configService.get("RATE_LIMIT_WINDOW_MS", 60000),
  skipSuccessfulRequests: configService.get("RATE_LIMIT_SKIP_SUCCESS", false),
  skipFailedRequests: configService.get("RATE_LIMIT_SKIP_FAILED", false),
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});
