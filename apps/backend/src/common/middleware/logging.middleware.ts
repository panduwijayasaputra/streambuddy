import { Injectable, NestMiddleware, Logger } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { ConfigService } from "@nestjs/config";

export interface LogEntry {
  timestamp: string;
  method: string;
  url: string;
  statusCode: number;
  responseTime: number;
  userAgent: string;
  ip: string;
  requestId: string;
  userId?: string;
  sessionId?: string;
}

@Injectable()
export class LoggingMiddleware implements NestMiddleware {
  private readonly logger = new Logger(LoggingMiddleware.name);

  constructor(private readonly configService: ConfigService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const startTime = Date.now();
    const requestId =
      (req.headers["x-request-id"] as string) || this.generateRequestId();

    // Add request ID to headers if not present
    if (!req.headers["x-request-id"]) {
      req.headers["x-request-id"] = requestId;
    }

    // Log request
    this.logRequest(req, requestId);

    // Override res.end to log response
    const originalEnd = res.end;
    res.end = function (chunk?: any, encoding?: any) {
      const responseTime = Date.now() - startTime;
      this.logResponse(req, res, responseTime, requestId);
      return originalEnd.call(this, chunk, encoding);
    }.bind(this);

    next();
  }

  private logRequest(req: Request, requestId: string): void {
    const isDevelopment = this.configService.get("NODE_ENV") === "development";
    const isProduction = this.configService.get("NODE_ENV") === "production";

    const logData = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      ip: this.getClientIp(req),
      userAgent: req.get("User-Agent") || "Unknown",
      requestId,
      userId: (req as any).user?.id,
      sessionId: req.headers["x-session-id"],
      query: isDevelopment ? req.query : undefined,
      body: isDevelopment ? this.sanitizeBody(req.body) : undefined,
    };

    if (isDevelopment) {
      this.logger.log(`📥 ${req.method} ${req.url} - ${requestId}`, logData);
    } else if (isProduction) {
      this.logger.log(
        `📥 ${req.method} ${req.url} - ${requestId} - ${logData.ip}`
      );
    }
  }

  private logResponse(
    req: Request,
    res: Response,
    responseTime: number,
    requestId: string
  ): void {
    const isDevelopment = this.configService.get("NODE_ENV") === "development";
    const isProduction = this.configService.get("NODE_ENV") === "production";

    const statusCode = res.statusCode;
    const logLevel = this.getLogLevel(statusCode);

    const logData = {
      timestamp: new Date().toISOString(),
      method: req.method,
      url: req.url,
      statusCode,
      responseTime: `${responseTime}ms`,
      requestId,
      userId: (req as any).user?.id,
      sessionId: req.headers["x-session-id"],
    };

    const logMessage = `📤 ${req.method} ${req.url} - ${statusCode} - ${responseTime}ms - ${requestId}`;

    switch (logLevel) {
      case "error":
        this.logger.error(logMessage, logData);
        break;
      case "warn":
        this.logger.warn(logMessage, logData);
        break;
      case "debug":
        this.logger.debug(logMessage, logData);
        break;
      default:
        this.logger.log(logMessage, logData);
    }

    // Log slow requests
    const slowRequestThreshold = this.configService.get(
      "SLOW_REQUEST_THRESHOLD",
      1000
    );
    if (responseTime > slowRequestThreshold) {
      this.logger.warn(
        `🐌 Slow request detected: ${req.method} ${req.url} - ${responseTime}ms - ${requestId}`
      );
    }

    // Log high error rates
    if (statusCode >= 500) {
      this.logger.error(
        `💥 Server error: ${req.method} ${req.url} - ${statusCode} - ${requestId}`
      );
    }
  }

  private getLogLevel(statusCode: number): "log" | "warn" | "error" | "debug" {
    if (statusCode >= 500) return "error";
    if (statusCode >= 400) return "warn";
    if (statusCode >= 300) return "debug";
    return "log";
  }

  private getClientIp(req: Request): string {
    return (
      req.ip ||
      req.connection.remoteAddress ||
      req.socket.remoteAddress ||
      (req.connection as any).socket?.remoteAddress ||
      req.headers["x-forwarded-for"] ||
      req.headers["x-real-ip"] ||
      "unknown"
    );
  }

  private sanitizeBody(body: any): any {
    if (!body) return body;

    const sensitiveFields = [
      "password",
      "token",
      "secret",
      "key",
      "authorization",
    ];
    const sanitized = { ...body };

    for (const field of sensitiveFields) {
      if (sanitized[field]) {
        sanitized[field] = "[REDACTED]";
      }
    }

    return sanitized;
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
