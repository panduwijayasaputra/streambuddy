import { Injectable, NestMiddleware } from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import helmet from "helmet";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class HelmetMiddleware implements NestMiddleware {
  private helmetMiddleware: any;

  constructor(private readonly configService: ConfigService) {
    this.helmetMiddleware = helmet({
      contentSecurityPolicy: {
        directives: {
          defaultSrc: ["'self'"],
          scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
          styleSrc: [
            "'self'",
            "'unsafe-inline'",
            "https://fonts.googleapis.com",
          ],
          fontSrc: ["'self'", "https://fonts.gstatic.com"],
          imgSrc: ["'self'", "data:", "https:"],
          connectSrc: ["'self'", "ws:", "wss:"],
          mediaSrc: ["'self'"],
          objectSrc: ["'none'"],
          baseUri: ["'self'"],
          formAction: ["'self'"],
        },
      },
      crossOriginEmbedderPolicy: false,
      crossOriginOpenerPolicy: { policy: "same-origin" },
      crossOriginResourcePolicy: { policy: "cross-origin" },
      dnsPrefetchControl: { allow: false },
      frameguard: { action: "deny" },
      hidePoweredBy: true,
      hsts: {
        maxAge: 31536000,
        includeSubDomains: true,
        preload: true,
      },
      ieNoOpen: true,
      noSniff: true,
      originAgentCluster: true,
      permittedCrossDomainPolicies: { permittedPolicies: "none" },
      referrerPolicy: { policy: "strict-origin-when-cross-origin" },
      xssFilter: true,
    });
  }

  use(req: Request, res: Response, next: NextFunction) {
    this.helmetMiddleware(req, res, next);
  }
}
