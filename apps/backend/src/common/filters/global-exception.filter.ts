import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from "@nestjs/common";
import { Request, Response } from "express";
import { ConfigService } from "@nestjs/config";

export interface ExceptionResponse {
  statusCode: number;
  message: string;
  error?: string;
  timestamp: string;
  path: string;
  method: string;
  requestId?: string;
  details?: any;
}

@Catch()
export class GlobalExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(GlobalExceptionFilter.name);

  constructor(private readonly configService: ConfigService) {}

  catch(exception: any, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const requestId =
      (request.headers["x-request-id"] as string) || this.generateRequestId();

    const isDevelopment = this.configService.get("NODE_ENV") === "development";
    const isProduction = this.configService.get("NODE_ENV") === "production";

    let statusCode = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = "Internal server error";
    let errorDetails: any = {};

    // Handle different types of exceptions
    if (exception instanceof HttpException) {
      statusCode = exception.getStatus();
      message = exception.message;

      const exceptionResponse = exception.getResponse();
      if (typeof exceptionResponse === "object") {
        errorDetails = exceptionResponse;
      }
    } else if (exception.name === "ValidationError") {
      statusCode = HttpStatus.BAD_REQUEST;
      message = "Validation error";
      errorDetails = { validationErrors: exception.details };
    } else if (exception.name === "TypeError") {
      statusCode = HttpStatus.BAD_REQUEST;
      message = "Type error";
      errorDetails = { type: exception.name, message: exception.message };
    } else if (exception.code === "ECONNREFUSED") {
      statusCode = HttpStatus.SERVICE_UNAVAILABLE;
      message = "Service temporarily unavailable";
      errorDetails = { code: exception.code };
    } else if (exception.code === "ETIMEDOUT") {
      statusCode = HttpStatus.REQUEST_TIMEOUT;
      message = "Request timeout";
      errorDetails = { code: exception.code };
    } else if (exception.code === "ENOTFOUND") {
      statusCode = HttpStatus.SERVICE_UNAVAILABLE;
      message = "Service not found";
      errorDetails = { code: exception.code };
    } else if (exception.code === "ECONNRESET") {
      statusCode = HttpStatus.SERVICE_UNAVAILABLE;
      message = "Connection reset";
      errorDetails = { code: exception.code };
    }

    // Log the exception
    const logLevel = statusCode >= 500 ? "error" : "warn";
    const logMessage = `${request.method} ${request.url} - ${statusCode} - ${requestId}`;

    if (logLevel === "error") {
      this.logger.error(logMessage, exception.stack);
    } else {
      this.logger.warn(logMessage, exception.message);
    }

    // Prepare error response
    const errorResponse: ExceptionResponse = {
      statusCode,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
      requestId,
    };

    // Add error details based on environment
    if (isDevelopment) {
      errorResponse.error = exception.name || "Error";
      errorResponse.details = {
        ...errorDetails,
        stack: exception.stack,
        message: exception.message,
        name: exception.name,
      };
    } else if (isProduction && statusCode >= 500) {
      errorResponse.error = "Internal Server Error";
      // In production, don't expose internal error details
    }

    // Set response headers
    response.setHeader("X-Request-ID", requestId);
    response.setHeader("X-Error-Code", statusCode.toString());

    // Send error response
    response.status(statusCode).json(errorResponse);
  }

  private generateRequestId(): string {
    return `req_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
