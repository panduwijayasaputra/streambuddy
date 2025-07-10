import { Controller, Get, HttpStatus, Res } from "@nestjs/common";
import { Response } from "express";
import { HealthService } from "./health.service";
import { LoggerService } from "../services/logger.service";
import { ConfigService } from "@nestjs/config";

@Controller("health")
export class HealthController {
  private readonly logger: LoggerService;

  constructor(
    private readonly healthService: HealthService,
    private readonly configService: ConfigService
  ) {
    this.logger = new LoggerService(configService);
  }

  @Get()
  async checkHealth(@Res() res: Response) {
    try {
      const health = await this.healthService.checkAll();

      const statusCode =
        health.status === "up" ? HttpStatus.OK : HttpStatus.SERVICE_UNAVAILABLE;

      res.status(statusCode).json({
        status: health.status,
        timestamp: health.timestamp,
        service: "streambuddy-backend",
        version: process.env.npm_package_version || "1.0.0",
        environment: process.env.NODE_ENV || "development",
        services: health.services,
      });
    } catch (error) {
      this.logger.error("Health check failed", undefined, {
        error: error.message,
      });

      res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        status: "down",
        timestamp: new Date().toISOString(),
        service: "streambuddy-backend",
        error: "Health check failed",
      });
    }
  }

  @Get("ready")
  async checkReadiness(@Res() res: Response) {
    try {
      const health = await this.healthService.checkAll();

      if (health.status === "up") {
        res.status(HttpStatus.OK).json({
          status: "ready",
          timestamp: new Date().toISOString(),
          service: "streambuddy-backend",
        });
      } else {
        res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
          status: "not ready",
          timestamp: new Date().toISOString(),
          service: "streambuddy-backend",
          issues: Object.entries(health.services)
            .filter(([_, service]) => service.status === "down")
            .map(([name, service]) => ({
              service: name,
              message: service.message,
            })),
        });
      }
    } catch (error) {
      this.logger.error("Readiness check failed", undefined, {
        error: error.message,
      });

      res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        status: "not ready",
        timestamp: new Date().toISOString(),
        service: "streambuddy-backend",
        error: "Readiness check failed",
      });
    }
  }

  @Get("live")
  async checkLiveness(@Res() res: Response) {
    // Liveness check - just check if the application is running
    res.status(HttpStatus.OK).json({
      status: "alive",
      timestamp: new Date().toISOString(),
      service: "streambuddy-backend",
    });
  }

  @Get("database")
  async checkDatabase(@Res() res: Response) {
    try {
      const dbHealth = await this.healthService.checkDatabase();

      const statusCode =
        dbHealth.status === "up"
          ? HttpStatus.OK
          : HttpStatus.SERVICE_UNAVAILABLE;

      res.status(statusCode).json({
        status: dbHealth.status,
        timestamp: new Date().toISOString(),
        service: "database",
        message: dbHealth.message,
      });
    } catch (error) {
      this.logger.error("Database health check failed", undefined, {
        error: error.message,
      });

      res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        status: "down",
        timestamp: new Date().toISOString(),
        service: "database",
        error: "Database health check failed",
      });
    }
  }

  @Get("redis")
  async checkRedis(@Res() res: Response) {
    try {
      const redisHealth = await this.healthService.checkRedis();

      const statusCode =
        redisHealth.status === "up"
          ? HttpStatus.OK
          : HttpStatus.SERVICE_UNAVAILABLE;

      res.status(statusCode).json({
        status: redisHealth.status,
        timestamp: new Date().toISOString(),
        service: "redis",
        message: redisHealth.message,
      });
    } catch (error) {
      this.logger.error("Redis health check failed", undefined, {
        error: error.message,
      });

      res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        status: "down",
        timestamp: new Date().toISOString(),
        service: "redis",
        error: "Redis health check failed",
      });
    }
  }

  @Get("openai")
  async checkOpenAI(@Res() res: Response) {
    try {
      const openaiHealth = await this.healthService.checkOpenAI();

      const statusCode =
        openaiHealth.status === "up"
          ? HttpStatus.OK
          : HttpStatus.SERVICE_UNAVAILABLE;

      res.status(statusCode).json({
        status: openaiHealth.status,
        timestamp: new Date().toISOString(),
        service: "openai",
        message: openaiHealth.message,
      });
    } catch (error) {
      this.logger.error("OpenAI health check failed", undefined, {
        error: error.message,
      });

      res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        status: "down",
        timestamp: new Date().toISOString(),
        service: "openai",
        error: "OpenAI health check failed",
      });
    }
  }

  @Get("websocket")
  async checkWebSocket(@Res() res: Response) {
    try {
      const wsHealth = await this.healthService.checkWebSocket();

      const statusCode =
        wsHealth.status === "up"
          ? HttpStatus.OK
          : HttpStatus.SERVICE_UNAVAILABLE;

      res.status(statusCode).json({
        status: wsHealth.status,
        timestamp: new Date().toISOString(),
        service: "websocket",
        message: wsHealth.message,
        activeSessions: wsHealth.activeSessions,
      });
    } catch (error) {
      this.logger.error("WebSocket health check failed", undefined, {
        error: error.message,
      });

      res.status(HttpStatus.SERVICE_UNAVAILABLE).json({
        status: "down",
        timestamp: new Date().toISOString(),
        service: "websocket",
        error: "WebSocket health check failed",
      });
    }
  }
}
