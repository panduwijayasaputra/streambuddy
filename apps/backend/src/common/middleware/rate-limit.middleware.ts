import {
  Injectable,
  NestMiddleware,
  HttpException,
  HttpStatus,
} from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { ConfigService } from "@nestjs/config";
import { RedisService } from "../services/redis.service";

@Injectable()
export class RateLimitMiddleware implements NestMiddleware {
  constructor(
    private readonly configService: ConfigService,
    private readonly redisService: RedisService
  ) {}

  async use(req: Request, res: Response, next: NextFunction) {
    const clientId = this.getClientId(req);
    const windowMs = this.configService.get("RATE_LIMIT_WINDOW_MS", 60000);
    const limit = this.configService.get("RATE_LIMIT_LIMIT", 100);
    const skipSuccessfulRequests = this.configService.get(
      "RATE_LIMIT_SKIP_SUCCESS",
      false
    );
    const skipFailedRequests = this.configService.get(
      "RATE_LIMIT_SKIP_FAILED",
      false
    );

    const key = `rate_limit:${clientId}`;
    const now = Date.now();
    const windowStart = now - windowMs;

    try {
      // Get current requests in the window
      const requests = await this.redisService.getListRange(key, 0, -1);
      const currentRequests = requests
        .map((timestamp) => parseInt(timestamp))
        .filter((timestamp) => timestamp > windowStart);

      // Check if limit exceeded
      if (currentRequests.length >= limit) {
        const oldestRequest = Math.min(...currentRequests);
        const resetTime = oldestRequest + windowMs;
        const retryAfter = Math.ceil((resetTime - now) / 1000);

        res.setHeader("X-RateLimit-Limit", limit);
        res.setHeader("X-RateLimit-Remaining", 0);
        res.setHeader("X-RateLimit-Reset", new Date(resetTime).toISOString());
        res.setHeader("Retry-After", retryAfter);

        throw new HttpException(
          this.configService.get(
            "RATE_LIMIT_MESSAGE",
            "Too many requests from this IP, please try again later."
          ),
          HttpStatus.TOO_MANY_REQUESTS
        );
      }

      // Add current request timestamp
      await this.redisService.pushList(key, now.toString());

      // Set expiration for the key (cleanup after window)
      await this.redisService.expire(key, Math.ceil(windowMs / 1000));

      // Set response headers
      res.setHeader("X-RateLimit-Limit", limit);
      res.setHeader(
        "X-RateLimit-Remaining",
        limit - currentRequests.length - 1
      );
      res.setHeader(
        "X-RateLimit-Reset",
        new Date(now + windowMs).toISOString()
      );

      // Handle response to update rate limit based on success/failure
      const originalSend = res.send;
      res.send = function (body) {
        const statusCode = res.statusCode;
        const isSuccess = statusCode >= 200 && statusCode < 300;
        const isFailure = statusCode >= 400;

        if (
          (isSuccess && skipSuccessfulRequests) ||
          (isFailure && skipFailedRequests)
        ) {
          // Remove the request from rate limit if it should be skipped
          this.redisService.popList(key).catch((err) => {
            console.error(
              "Failed to remove skipped request from rate limit:",
              err
            );
          });
        }

        return originalSend.call(this, body);
      }.bind({ redisService: this.redisService });

      next();
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }

      // If Redis is unavailable, allow the request but log the error
      console.error("Rate limiting error:", error);
      next();
    }
  }

  private getClientId(req: Request): string {
    // Use IP address as default client identifier
    const ip = req.ip || req.connection.remoteAddress || "unknown";

    // For API routes, you might want to use API key or user ID
    const apiKey = req.headers["x-api-key"] as string;
    if (apiKey) {
      return `api:${apiKey}`;
    }

    // For authenticated users, use user ID
    const userId = (req as any).user?.id;
    if (userId) {
      return `user:${userId}`;
    }

    return `ip:${ip}`;
  }
}
