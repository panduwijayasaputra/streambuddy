import {
  Injectable,
  NestMiddleware,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Request, Response, NextFunction } from "express";
import { ConfigService } from "@nestjs/config";

export interface ErrorResponse {
  statusCode: number;
  message: string;
  error?: string;
  timestamp: string;
  path: string;
  method: string;
  requestId?: string;
  details?: any;
}

@Injectable()
export class ErrorHandlerMiddleware implements NestMiddleware {
  private readonly logger = new Logger(ErrorHandlerMiddleware.name);

  constructor(private readonly configService: ConfigService) {}

  use(req: Request, res: Response, next: NextFunction) {
    const originalSend = res.send;
    const requestId = this.generateRequestId();

    // Add request ID to response headers
    res.setHeader("X-Request-ID", requestId);

    // Override res.send to catch errors
    res.send = function (body) {
      try {
        // Log successful responses in development
        if (this.configService.get("NODE_ENV") === "development") {
          this.logger.log(
            `${req.method} ${req.path} - ${res.statusCode} - ${requestId}`
          );
        }
        return originalSend.call(this, body);
      } catch (error) {
        this.logger.error(
          `Error in response send: ${error.message}`,
          error.stack
        );
        return originalSend.call(this, body);
      }
    }.bind({ configService: this.configService, logger: this.logger });

    // Handle uncaught exceptions
    const originalErrorHandler = res.on;
    res.on = function (event, listener) {
      if (event === "error") {
        return originalErrorHandler.call(this, event, (error) => {
          this.handleError(error, req, res, requestId);
          listener(error);
        });
      }
      return originalErrorHandler.call(this, event, listener);
    }.bind(this);

    next();
  }

  private handleError(
    error: any,
    req: Request,
    res: Response,
    requestId: string
  ): void {
    const isDevelopment = this.configService.get("NODE_ENV") === "development";
    const isProduction = this.configService.get("NODE_ENV") === "production";

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = "Internal server error";
    let errorDetails: any = {};

    // Handle different types of errors
    if (error instanceof HttpException) {
      statusCode = error.getStatus();
      message = error.message;

      const response = error.getResponse();
      if (typeof response === "object") {
        errorDetails = response;
      }
    } else if (error.name === "ValidationError") {
      statusCode = HttpStatus.BAD_REQUEST;
      message = "Validation error";
      errorDetails = { validationErrors: error.details };
    } else if (error.name === "TypeError") {
      statusCode = HttpStatus.BAD_REQUEST;
      message = "Type error";
      errorDetails = { type: error.name, message: error.message };
    } else if (error.code === "ECONNREFUSED") {
      statusCode = HttpStatus.SERVICE_UNAVAILABLE;
      message = "Service temporarily unavailable";
      errorDetails = { code: error.code };
    } else if (error.code === "ETIMEDOUT") {
      statusCode = HttpStatus.REQUEST_TIMEOUT;
      message = "Request timeout";
      errorDetails = { code: error.code };
    }

    // Log error with appropriate level
    const logLevel = statusCode >= 500 ? "error" : "warn";
    const logMessage = `${req.method} ${req.path} - ${statusCode} - ${requestId}`;

    if (logLevel === "error") {
      this.logger.error(logMessage, error.stack);
    } else {
      this.logger.warn(logMessage, error.message);
    }

    // Prepare error response
    const errorResponse: ErrorResponse = {
      statusCode,
      message,
      timestamp: new Date().toISOString(),
      path: req.path,
      method: req.method,
      requestId,
    };

    // Add error details in development
    if (isDevelopment) {
      errorResponse.error = error.name;
      errorResponse.details = {
        ...errorDetails,
        stack: error.stack,
        message: error.message,
      };
    }

    // Add error details in production for specific error types
    if (isProduction && statusCode >= 500) {
      errorResponse.error = "Internal Server Error";
    }

    // Send error response
    res.status(statusCode).json(errorResponse);
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
