// Environment configuration for StreamBuddy
// This module provides type-safe access to environment variables

export interface StreamBuddyConfig {
  // API Configuration
  apiBaseUrl: string;
  wsUrl: string;

  // Authentication
  authDomain: string;
  authClientId: string;

  // External APIs
  twitchClientId: string;
  youtubeApiKey: string;
  discordClientId: string;

  // AI/ML Services
  openaiApiKey: string;
  anthropicApiKey: string;

  // Analytics & Monitoring
  sentryDsn: string;
  googleAnalyticsId: string;

  // Feature Flags
  enableChatProcessing: boolean;
  enableAiResponses: boolean;
  enableOverlay: boolean;
  enableAnalytics: boolean;

  // Development
  debugMode: boolean;
  logLevel: "debug" | "info" | "warn" | "error";
}

// Helper function to get environment variable with fallback
function getEnvVar(key: string, fallback: string = ""): string {
  return process.env[key] || fallback;
}

// Helper function to get boolean environment variable
function getBoolEnvVar(key: string, fallback: boolean = false): boolean {
  const value = process.env[key];
  if (value === undefined) return fallback;
  return value.toLowerCase() === "true";
}

// StreamBuddy configuration object
export const config: StreamBuddyConfig = {
  // API Configuration
  apiBaseUrl: getEnvVar(
    "NEXT_PUBLIC_API_BASE_URL",
    "http://localhost:3001/api"
  ),
  wsUrl: getEnvVar("NEXT_PUBLIC_WS_URL", "ws://localhost:3001/ws"),

  // Authentication
  authDomain: getEnvVar("NEXT_PUBLIC_AUTH_DOMAIN", "auth.streambuddy.com"),
  authClientId: getEnvVar("NEXT_PUBLIC_AUTH_CLIENT_ID", ""),

  // External APIs
  twitchClientId: getEnvVar("NEXT_PUBLIC_TWITCH_CLIENT_ID", ""),
  youtubeApiKey: getEnvVar("NEXT_PUBLIC_YOUTUBE_API_KEY", ""),
  discordClientId: getEnvVar("NEXT_PUBLIC_DISCORD_CLIENT_ID", ""),

  // AI/ML Services
  openaiApiKey: getEnvVar("NEXT_PUBLIC_OPENAI_API_KEY", ""),
  anthropicApiKey: getEnvVar("NEXT_PUBLIC_ANTHROPIC_API_KEY", ""),

  // Analytics & Monitoring
  sentryDsn: getEnvVar("NEXT_PUBLIC_SENTRY_DSN", ""),
  googleAnalyticsId: getEnvVar("NEXT_PUBLIC_GOOGLE_ANALYTICS_ID", ""),

  // Feature Flags
  enableChatProcessing: getBoolEnvVar(
    "NEXT_PUBLIC_ENABLE_CHAT_PROCESSING",
    true
  ),
  enableAiResponses: getBoolEnvVar("NEXT_PUBLIC_ENABLE_AI_RESPONSES", true),
  enableOverlay: getBoolEnvVar("NEXT_PUBLIC_ENABLE_OVERLAY", true),
  enableAnalytics: getBoolEnvVar("NEXT_PUBLIC_ENABLE_ANALYTICS", true),

  // Development
  debugMode: getBoolEnvVar("NEXT_PUBLIC_DEBUG_MODE", false),
  logLevel: getEnvVar("NEXT_PUBLIC_LOG_LEVEL", "info") as
    | "debug"
    | "info"
    | "warn"
    | "error",
};

// Validation function to check required environment variables
export function validateConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  // Check required API keys
  if (!config.openaiApiKey && config.enableAiResponses) {
    errors.push("OpenAI API key is required when AI responses are enabled");
  }

  if (!config.anthropicApiKey && config.enableAiResponses) {
    errors.push("Anthropic API key is required when AI responses are enabled");
  }

  // Check external API configurations
  if (!config.twitchClientId) {
    errors.push("Twitch Client ID is required for Twitch integration");
  }

  if (!config.youtubeApiKey) {
    errors.push("YouTube API key is required for YouTube integration");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

// Export default config
export default config;
