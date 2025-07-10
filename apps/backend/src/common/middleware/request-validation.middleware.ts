import {
  Injectable,
  NestMiddleware,
  BadRequestException,
} from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class RequestValidationMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService) {}

  use(req: Request, res: Response, next: NextFunction) {
    // Validate Content-Type for POST/PUT/PATCH requests
    if (["POST", "PUT", "PATCH"].includes(req.method)) {
      const contentType = req.headers["content-type"];
      if (!contentType || !contentType.includes("application/json")) {
        throw new BadRequestException("Content-Type must be application/json");
      }
    }

    // Validate request size
    const contentLength = parseInt(req.headers["content-length"] || "0");
    const maxSize = this.configService.get<number>(
      "MAX_REQUEST_SIZE",
      10 * 1024 * 1024
    ); // 10MB default
    if (contentLength > maxSize) {
      throw new BadRequestException(
        `Request too large. Maximum size is ${maxSize} bytes`
      );
    }

    // Sanitize request headers
    this.sanitizeHeaders(req);

    // Validate and sanitize query parameters
    this.sanitizeQueryParams(req);

    // Validate and sanitize body (for JSON requests)
    if (req.body && typeof req.body === "object") {
      this.sanitizeBody(req);
    }

    next();
  }

  private sanitizeHeaders(req: Request): void {
    // Remove potentially dangerous headers
    const dangerousHeaders = [
      "x-forwarded-for",
      "x-real-ip",
      "x-forwarded-proto",
      "x-forwarded-host",
      "x-forwarded-port",
    ];

    dangerousHeaders.forEach((header) => {
      if (req.headers[header]) {
        delete req.headers[header];
      }
    });
  }

  private sanitizeQueryParams(req: Request): void {
    if (!req.query) return;

    // Remove potentially dangerous query parameters
    const dangerousParams = ["__proto__", "constructor", "prototype"];

    dangerousParams.forEach((param) => {
      if (req.query[param]) {
        delete req.query[param];
      }
    });

    // Limit query parameter length
    Object.keys(req.query).forEach((key) => {
      const value = req.query[key];
      if (typeof value === "string" && value.length > 1000) {
        throw new BadRequestException(`Query parameter ${key} too long`);
      }
    });
  }

  private sanitizeBody(req: Request): void {
    if (!req.body || typeof req.body !== "object") return;

    // Remove potentially dangerous properties
    const dangerousProps = ["__proto__", "constructor", "prototype"];

    dangerousProps.forEach((prop) => {
      if (req.body[prop]) {
        delete req.body[prop];
      }
    });

    // Limit nested object depth
    const maxDepth = 10;
    this.checkObjectDepth(req.body, maxDepth);
  }

  private checkObjectDepth(
    obj: any,
    maxDepth: number,
    currentDepth: number = 0
  ): void {
    if (currentDepth > maxDepth) {
      throw new BadRequestException("Request body too deeply nested");
    }

    if (obj && typeof obj === "object") {
      Object.values(obj).forEach((value) => {
        if (typeof value === "object" && value !== null) {
          this.checkObjectDepth(value, maxDepth, currentDepth + 1);
        }
      });
    }
  }
}
