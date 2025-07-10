import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class CorsMiddleware implements NestMiddleware {
  constructor(private readonly configService: ConfigService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const allowedOrigins = this.configService.get<string>(
      "ALLOWED_ORIGINS",
      "http://localhost:3000,http://localhost:3001"
    );
    const origins = allowedOrigins.split(",").map((origin) => origin.trim());

    const origin = req.headers.origin;

    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) {
      res.header("Access-Control-Allow-Origin", "*");
    } else if (origins.includes(origin) || origins.includes("*")) {
      res.header("Access-Control-Allow-Origin", origin);
    }

    // CORS headers
    res.header(
      "Access-Control-Allow-Methods",
      "GET, POST, PUT, DELETE, PATCH, OPTIONS"
    );
    res.header(
      "Access-Control-Allow-Headers",
      "Origin, X-Requested-With, Content-Type, Accept, Authorization, X-API-Key"
    );
    res.header("Access-Control-Allow-Credentials", "true");
    res.header("Access-Control-Max-Age", "86400"); // 24 hours

    // Handle preflight requests
    if (req.method === "OPTIONS") {
      res.status(200).end();
      return;
    }

    next();
  }
}
