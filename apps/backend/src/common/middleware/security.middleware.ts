import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class SecurityMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService) {}

  use(req: Request, res: Response, next: NextFunction) {
    // Security headers
    res.header("X-Content-Type-Options", "nosniff");
    res.header("X-Frame-Options", "DENY");
    res.header("X-XSS-Protection", "1; mode=block");
    res.header("Referrer-Policy", "strict-origin-when-cross-origin");
    res.header(
      "Permissions-Policy",
      "camera=(), microphone=(), geolocation=()"
    );

    // Content Security Policy
    const csp = this.buildCSP();
    res.header("Content-Security-Policy", csp);

    // Strict Transport Security (only in production)
    if (this.configService.get<string>("NODE_ENV") === "production") {
      res.header(
        "Strict-Transport-Security",
        "max-age=31536000; includeSubDomains; preload"
      );
    }

    // Remove server information
    res.removeHeader("X-Powered-By");

    // Rate limiting headers (if using rate limiting)
    if (req.headers["x-ratelimit-limit"]) {
      res.header(
        "X-RateLimit-Limit",
        req.headers["x-ratelimit-limit"] as string
      );
      res.header(
        "X-RateLimit-Remaining",
        req.headers["x-ratelimit-remaining"] as string
      );
      res.header(
        "X-RateLimit-Reset",
        req.headers["x-ratelimit-reset"] as string
      );
    }

    next();
  }

  private buildCSP(): string {
    const isDevelopment =
      this.configService.get<string>("NODE_ENV") === "development";

    const directives = [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'",
      "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
      "font-src 'self' https://fonts.gstatic.com",
      "img-src 'self' data: https:",
      "connect-src 'self' ws: wss:",
      "media-src 'self'",
      "object-src 'none'",
      "base-uri 'self'",
      "form-action 'self'",
    ];

    if (isDevelopment) {
      directives.push(
        "script-src 'self' 'unsafe-inline' 'unsafe-eval' http://localhost:*"
      );
      directives.push("connect-src 'self' ws: wss: http://localhost:*");
    }

    return directives.join("; ");
  }
}
