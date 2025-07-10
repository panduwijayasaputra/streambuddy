import { Injectable, LoggerService as NestLoggerService } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

export interface LogContext {
  requestId?: string;
  userId?: string;
  sessionId?: string;
  method?: string;
  url?: string;
  ip?: string;
  userAgent?: string;
  [key: string]: any;
}

export interface LogEntry {
  timestamp: string;
  level: "log" | "error" | "warn" | "debug" | "verbose";
  message: string;
  context?: LogContext;
  data?: any;
}

@Injectable()
export class LoggerService implements NestLoggerService {
  private readonly isDevelopment: boolean;
  private readonly isProduction: boolean;
  private readonly logLevel: string;

  constructor(private readonly configService: ConfigService) {
    this.isDevelopment = this.configService.get("NODE_ENV") === "development";
    this.isProduction = this.configService.get("NODE_ENV") === "production";
    this.logLevel = this.configService.get("LOG_LEVEL", "info");
  }

  log(message: string, context?: LogContext, data?: any) {
    this.writeLog("log", message, context, data);
  }

  error(message: string, trace?: string, context?: LogContext, data?: any) {
    this.writeLog("error", message, context, { ...data, trace });
  }

  warn(message: string, context?: LogContext, data?: any) {
    this.writeLog("warn", message, context, data);
  }

  debug(message: string, context?: LogContext, data?: any) {
    if (this.shouldLog("debug")) {
      this.writeLog("debug", message, context, data);
    }
  }

  verbose(message: string, context?: LogContext, data?: any) {
    if (this.shouldLog("verbose")) {
      this.writeLog("verbose", message, context, data);
    }
  }

  private writeLog(
    level: LogEntry["level"],
    message: string,
    context?: LogContext,
    data?: any
  ) {
    const timestamp = new Date().toISOString();
    const logEntry: LogEntry = {
      timestamp,
      level,
      message,
      context,
      data,
    };

    // Format log message based on environment
    if (this.isDevelopment) {
      this.formatDevelopmentLog(logEntry);
    } else if (this.isProduction) {
      this.formatProductionLog(logEntry);
    } else {
      this.formatDefaultLog(logEntry);
    }
  }

  private formatDevelopmentLog(logEntry: LogEntry) {
    const { timestamp, level, message, context, data } = logEntry;

    // Color-coded console output for development
    const colors = {
      log: "\x1b[32m", // Green
      error: "\x1b[31m", // Red
      warn: "\x1b[33m", // Yellow
      debug: "\x1b[36m", // Cyan
      verbose: "\x1b[35m", // Magenta
    };

    const color = colors[level] || "\x1b[0m";
    const reset = "\x1b[0m";

    let output = `${color}[${timestamp}] ${level.toUpperCase()}: ${message}${reset}`;

    if (context) {
      output += `\n${color}Context: ${JSON.stringify(context, null, 2)}${reset}`;
    }

    if (data) {
      output += `\n${color}Data: ${JSON.stringify(data, null, 2)}${reset}`;
    }

    console.log(output);
  }

  private formatProductionLog(logEntry: LogEntry) {
    const { timestamp, level, message, context, data } = logEntry;

    // Structured JSON logging for production
    const logObject = {
      timestamp,
      level: level.toUpperCase(),
      message,
      service: "streambuddy-backend",
      environment: "production",
      ...context,
      ...(data && { data }),
    };

    console.log(JSON.stringify(logObject));
  }

  private formatDefaultLog(logEntry: LogEntry) {
    const { timestamp, level, message, context, data } = logEntry;

    let output = `[${timestamp}] ${level.toUpperCase()}: ${message}`;

    if (context) {
      output += ` | Context: ${JSON.stringify(context)}`;
    }

    if (data) {
      output += ` | Data: ${JSON.stringify(data)}`;
    }

    console.log(output);
  }

  private shouldLog(level: string): boolean {
    const levels = {
      error: 0,
      warn: 1,
      log: 2,
      debug: 3,
      verbose: 4,
    };

    const currentLevel = levels[this.logLevel as keyof typeof levels] || 2;
    const requestedLevel = levels[level as keyof typeof levels] || 2;

    return requestedLevel <= currentLevel;
  }

  // Specialized logging methods
  logRequest(req: any, requestId: string) {
    this.log("Incoming request", {
      requestId,
      method: req.method,
      url: req.url,
      ip: req.ip,
      userAgent: req.get("User-Agent"),
    });
  }

  logResponse(req: any, res: any, responseTime: number, requestId: string) {
    const level =
      res.statusCode >= 500 ? "error" : res.statusCode >= 400 ? "warn" : "log";

    if (level === "error") {
      this.error("Request completed", undefined, {
        requestId,
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        responseTime: `${responseTime}ms`,
      });
    } else if (level === "warn") {
      this.warn("Request completed", {
        requestId,
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        responseTime: `${responseTime}ms`,
      });
    } else {
      this.log("Request completed", {
        requestId,
        method: req.method,
        url: req.url,
        statusCode: res.statusCode,
        responseTime: `${responseTime}ms`,
      });
    }
  }

  logDatabaseQuery(
    query: string,
    params: any[],
    duration: number,
    requestId?: string
  ) {
    this.debug("Database query executed", {
      requestId,
      query,
      params,
      duration: `${duration}ms`,
    });
  }

  logCacheHit(key: string, requestId?: string) {
    this.debug("Cache hit", {
      requestId,
      cacheKey: key,
    });
  }

  logCacheMiss(key: string, requestId?: string) {
    this.debug("Cache miss", {
      requestId,
      cacheKey: key,
    });
  }

  logOpenAIRequest(model: string, tokens: number, requestId?: string) {
    this.log("OpenAI request", {
      requestId,
      model,
      tokens,
    });
  }

  logWebSocketEvent(event: string, sessionId: string, requestId?: string) {
    this.debug("WebSocket event", {
      requestId,
      event,
      sessionId,
    });
  }

  logError(error: Error, context?: LogContext) {
    this.error(error.message, error.stack, context);
  }

  logPerformance(operation: string, duration: number, context?: LogContext) {
    const level = duration > 1000 ? "warn" : "debug";
    this[level](`Performance: ${operation}`, {
      ...context,
      duration: `${duration}ms`,
    });
  }
}
