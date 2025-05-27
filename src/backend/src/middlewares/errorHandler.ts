import { Request, Response, NextFunction } from 'express';
import { v4 as uuidv4 } from 'uuid';
import { logger } from '../utils/logger';

// Custom error class with status code
export class AppError extends Error {
  statusCode: number;
  code: string;
  details?: Record<string, any>;
  isOperational: boolean;

  constructor(
    message: string, 
    statusCode: number, 
    code: string = 'INTERNAL_SERVER_ERROR',
    details?: Record<string, any>,
    isOperational: boolean = true
  ) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    this.isOperational = isOperational;
    Error.captureStackTrace(this, this.constructor);
  }
}

// Error handler middleware
export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  // Generate request ID if not present
  const requestId = (req as any).requestId || uuidv4();

  // Default error values
  let statusCode = 500;
  let errorCode = 'INTERNAL_SERVER_ERROR';
  let details: Record<string, any> | undefined = undefined;
  let isOperational = false;

  // Extract error information if it's an AppError
  if (err instanceof AppError) {
    statusCode = err.statusCode;
    errorCode = err.code;
    details = err.details;
    isOperational = err.isOperational;
  }

  // Specific handling for known error types
  if (err.name === 'ValidationError') {
    statusCode = 400;
    errorCode = 'VALIDATION_ERROR';
  } else if (err.name === 'UnauthorizedError') {
    statusCode = 401;
    errorCode = 'UNAUTHORIZED';
  } else if (err.name === 'JsonWebTokenError') {
    statusCode = 401;
    errorCode = 'INVALID_TOKEN';
  } else if (err.name === 'TokenExpiredError') {
    statusCode = 401;
    errorCode = 'TOKEN_EXPIRED';
  }

  // Log the error
  if (isOperational) {
    logger.warn({
      message: `Operational error: ${err.message}`,
      errorCode,
      statusCode,
      requestId,
      details,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
    });
  } else {
    logger.error({
      message: `Server error: ${err.message}`,
      errorCode,
      statusCode,
      requestId,
      details,
      stack: err.stack,
    });
  }

  // Send error response
  res.status(statusCode).json({
    status: 'error',
    code: errorCode,
    message: err.message,
    details: details,
    requestId: requestId,
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
};

// 404 handler middleware
export const notFoundHandler = (req: Request, _res: Response, next: NextFunction) => {
  const error = new AppError(`Not Found - ${req.originalUrl}`, 404, 'NOT_FOUND');
  next(error);
};